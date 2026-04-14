import mongoose from "mongoose";
import PatientReport from "../models/patientReportModel.js";
import { fetchAppointmentByIdForUser } from "../clients/appointmentClient.js";
import { fetchUserByIdInternal } from "../clients/authClient.js";
import {
  parseExpiresAt,
  validateReportIdFormat,
} from "../validation/patientReportValidation.js";

// Check if a report is currently shared with a given doctor
const hasActiveDoctorShare = (report, doctorId) => {
  if (!report || !doctorId) return false;
  const now = new Date();
  const shares = Array.isArray(report.sharedWith) ? report.sharedWith : [];
  return shares.some((share) => {
    if (!share?.doctorId) return false;
    if (String(share.doctorId) !== String(doctorId)) return false;
    if (!share.expiresAt) return true;
    return new Date(share.expiresAt) > now;
  });
};

// Allow a patient to grant or update a doctor's access to a report
export const grantDoctorAccessToPatientReportService = async ({
  user,
  params,
  body,
}) => {
  const role = user?.role;
  if (role !== "patient") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const userId = user?.id;
  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Missing user context",
      },
    };
  }

  const reportId = params?.id;
  const doctorId = (body?.doctorId || "").trim();

  if (!reportId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Report id is required",
      },
    };
  }

  if (!mongoose.isValidObjectId(reportId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }

  if (!doctorId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "doctorId is required",
      },
    };
  }

  const { expiresAt, error: expiresAtError } = parseExpiresAt(body?.expiresAt);
  if (expiresAtError) {
    return expiresAtError;
  }

  try {
    const idError = validateReportIdFormat(reportId);
    if (idError) {
      return idError;
    }

    const report = await PatientReport.findById(reportId);

    if (!report) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Report not found",
        },
      };
    }

    if (String(report.userId) !== String(userId)) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Access denied",
        },
      };
    }

    const shares = Array.isArray(report.sharedWith) ? report.sharedWith : [];
    const existing = shares.find(
      (share) => String(share.doctorId) === String(doctorId),
    );

    if (existing) {
      existing.grantedAt = new Date();
      existing.expiresAt = expiresAt;
    } else {
      shares.push({
        doctorId,
        grantedAt: new Date(),
        expiresAt,
      });
    }

    report.sharedWith = shares;
    await report.save();

    return {
      status: 200,
      body: {
        success: true,
        data: report,
      },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }
};

// Get all reports that are currently shared with the authenticated doctor
export const getSharedWithMePatientReportsService = async (user) => {
  const role = user?.role;
  if (role !== "doctor") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const doctorId = user?.id;
  if (!doctorId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Missing user context",
      },
    };
  }

  const now = new Date();
  const reports = await PatientReport.find({
    sharedWith: {
      $elemMatch: {
        doctorId: String(doctorId),
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      },
    },
  }).sort({ createdAt: -1 });

  // Enrich each report with basic patient info (name, profile photo)
  const uniqueUserIds = [
    ...new Set(
      reports
        .map((r) => (r && r.userId ? String(r.userId) : null))
        .filter(Boolean),
    ),
  ];

  const userMap = {};
  for (const id of uniqueUserIds) {
    try {
      const userRecord = await fetchUserByIdInternal(id);
      if (userRecord) {
        userMap[id] = {
          name: userRecord.name,
          profilePhoto: userRecord.profilePhoto,
        };
      }
    } catch (error) {
      // If user lookup fails, skip enrichment for that id
      // and continue processing other records.
    }
  }

  const enrichedReports = reports.map((report) => {
    const plain = report.toObject({ virtuals: false });
    const userInfo = userMap[String(report.userId)] || null;
    if (userInfo) {
      plain.patientName = userInfo.name;
      plain.patientProfilePhoto = userInfo.profilePhoto;
    }
    return plain;
  });

  return {
    status: 200,
    body: {
      success: true,
      data: enrichedReports,
    },
  };
};

// Get a single report if the caller is the patient, a shared doctor, or the appointment's doctor
export const getPatientReportByIdService = async ({ user, params }) => {
  const role = user?.role;
  if (role !== "patient" && role !== "doctor") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const userId = user?.id;
  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Missing user context",
      },
    };
  }

  const reportId = params?.id;
  if (!reportId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Report id is required",
      },
    };
  }

  if (!mongoose.isValidObjectId(reportId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }
  const idError = validateReportIdFormat(reportId);
  if (idError) {
    return idError;
  }

  try {
    const report = await PatientReport.findById(reportId);
    if (!report) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Report not found",
        },
      };
    }

    const isPatientOwner =
      role === "patient" && String(report.userId) === String(userId);
    const isDoctorShared =
      role === "doctor" && hasActiveDoctorShare(report, userId);

    let isDoctorFromAppointment = false;

    if (!isPatientOwner && !isDoctorShared && role === "doctor") {
      if (report.appointmentId) {
        try {
          const appointment = await fetchAppointmentByIdForUser(
            report.appointmentId,
            { id: userId, role },
          );

          if (appointment) {
            const isDoctorOwner =
              appointment.doctorId &&
              (appointment.doctorId.toString
                ? appointment.doctorId.toString() === String(userId)
                : String(appointment.doctorId) === String(userId));
            const isSamePatient =
              appointment.patientId &&
              (appointment.patientId.toString
                ? appointment.patientId.toString() === String(report.userId)
                : String(appointment.patientId) === String(report.userId));

            isDoctorFromAppointment = Boolean(isDoctorOwner && isSamePatient);
          }
        } catch (error) {
          isDoctorFromAppointment = false;
        }
      }
    }

    if (!isPatientOwner && !isDoctorShared && !isDoctorFromAppointment) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Access denied",
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        data: report,
      },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }
};

// Revoke a doctor's access to a patient's report
export const revokeDoctorAccessToPatientReportService = async ({
  user,
  params,
}) => {
  const role = user?.role;
  if (role !== "patient") {
    return {
      status: 403,
      body: {
        success: false,
        message: "Access denied",
      },
    };
  }

  const userId = user?.id;
  if (!userId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Missing user context",
      },
    };
  }

  const reportId = params?.id;
  const doctorId = params?.doctorId;

  if (!reportId || !doctorId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "report id and doctorId are required",
      },
    };
  }

  if (!mongoose.isValidObjectId(reportId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }
  const idError = validateReportIdFormat(reportId);
  if (idError) {
    return idError;
  }

  try {
    const report = await PatientReport.findById(reportId);
    if (!report) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Report not found",
        },
      };
    }

    if (String(report.userId) !== String(userId)) {
      return {
        status: 403,
        body: {
          success: false,
          message: "Access denied",
        },
      };
    }

    const updateResult = await PatientReport.updateOne(
      { _id: reportId, "sharedWith.doctorId": String(doctorId) },
      { $pull: { sharedWith: { doctorId: String(doctorId) } } },
    );

    if (!updateResult || updateResult.matchedCount === 0) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Share not found",
        },
      };
    }

    const updated = await PatientReport.findById(reportId);

    return {
      status: 200,
      body: {
        success: true,
        data: updated,
      },
    };
  } catch (error) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Invalid report id",
      },
    };
  }
};
