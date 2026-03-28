import PatientReport from "../models/patientReportModel.js";
import { fetchAppointmentByIdForUser } from "../clients/appointmentClient.js";

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

export const uploadPatientReport = async (req, res) => {
  const role = req.user?.role;
  if (role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const title = (req.body?.title || "").trim();
  const description = req.body?.description;
  const appointmentId = req.body?.appointmentId;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  // If an appointmentId is provided, verify that it belongs to the
  // authenticated patient before attaching the report to it.
  if (typeof appointmentId === "string" && appointmentId.trim()) {
    try {
      const appointment = await fetchAppointmentByIdForUser(
        appointmentId.trim(),
        { id: userId, role },
      );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      const isPatientOwner =
        appointment.patientId &&
        (appointment.patientId.toString
          ? appointment.patientId.toString() === String(userId)
          : String(appointment.patientId) === String(userId));

      if (!isPatientOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only attach reports to your own appointments",
        });
      }
    } catch (error) {
      const status = error?.response?.status || 502;
      const message =
        error?.response?.data?.message || "Failed to validate appointment";
      return res.status(status).json({ success: false, message });
    }
  }

  const report = await PatientReport.create({
    userId,
    title,
    ...(typeof description === "string" && description.trim()
      ? { description: description.trim() }
      : {}),
    ...(typeof appointmentId === "string" && appointmentId.trim()
      ? { appointmentId: appointmentId.trim() }
      : {}),
    mimeType: req.file.mimetype,
    cloudinaryPublicId: req.file.filename,
    cloudinaryUrl: req.file.path,
  });

  return res.status(201).json({
    success: true,
    data: report,
  });
};

export const getMyPatientReports = async (req, res) => {
  const role = req.user?.role;
  if (role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  const appointmentId = (req.query?.appointmentId || "").trim();

  const filter = { userId };
  if (appointmentId) {
    filter.appointmentId = appointmentId;
  }

  const reports = await PatientReport.find(filter).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: reports,
  });
};

export const grantDoctorAccessToPatientReport = async (req, res) => {
  const role = req.user?.role;
  if (role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  const reportId = req.params?.id;
  const doctorId = (req.body?.doctorId || "").trim();

  if (!reportId) {
    return res.status(400).json({
      success: false,
      message: "Report id is required",
    });
  }

  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "doctorId is required",
    });
  }

  let expiresAt = null;
  if (req.body?.expiresAt) {
    const parsed = new Date(req.body.expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({
        success: false,
        message: "expiresAt must be a valid date",
      });
    }
    expiresAt = parsed;
  }

  try {
    const report = await PatientReport.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (String(report.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
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

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid report id",
    });
  }
};

export const getSharedWithMePatientReports = async (req, res) => {
  const role = req.user?.role;
  if (role !== "doctor") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
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

  return res.status(200).json({
    success: true,
    data: reports,
  });
};

export const getReportsForAppointment = async (req, res) => {
  const role = req.user?.role;
  if (role !== "doctor") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  const appointmentId = (req.params?.appointmentId || "").trim();
  if (!appointmentId) {
    return res.status(400).json({
      success: false,
      message: "appointmentId is required",
    });
  }

  try {
    const appointment = await fetchAppointmentByIdForUser(appointmentId, {
      id: doctorId,
      role,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const isDoctorOwner =
      appointment.doctorId &&
      (appointment.doctorId.toString
        ? appointment.doctorId.toString() === String(doctorId)
        : String(appointment.doctorId) === String(doctorId));

    if (!isDoctorOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only view reports for your own appointments",
      });
    }

    const patientId =
      appointment.patientId &&
      (appointment.patientId.toString
        ? appointment.patientId.toString()
        : String(appointment.patientId));

    if (!patientId) {
      return res.status(500).json({
        success: false,
        message: "Appointment is missing patient information",
      });
    }

    const reports = await PatientReport.find({
      appointmentId,
      userId: patientId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    const status = error?.response?.status || 502;
    const message =
      error?.response?.data?.message || "Failed to validate appointment";
    return res.status(status).json({ success: false, message });
  }
};

export const getPatientReportById = async (req, res) => {
  const role = req.user?.role;
  if (role !== "patient" && role !== "doctor") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  const reportId = req.params?.id;
  if (!reportId) {
    return res.status(400).json({
      success: false,
      message: "Report id is required",
    });
  }

  try {
    const report = await PatientReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const isPatientOwner =
      role === "patient" && String(report.userId) === String(userId);
    const isDoctorShared =
      role === "doctor" && hasActiveDoctorShare(report, userId);

    let isDoctorFromAppointment = false;

    // If the report is linked to an appointment, allow the doctor who owns
    // that appointment (and its patient) to view the report, even if it
    // wasn't explicitly shared.
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
          // On failure to validate the appointment, keep access denied.
          isDoctorFromAppointment = false;
        }
      }
    }

    if (!isPatientOwner && !isDoctorShared && !isDoctorFromAppointment) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid report id",
    });
  }
};

export const revokeDoctorAccessToPatientReport = async (req, res) => {
  const role = req.user?.role;
  if (role !== "patient") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Missing user context",
    });
  }

  const reportId = req.params?.id;
  const doctorId = req.params?.doctorId;

  if (!reportId || !doctorId) {
    return res.status(400).json({
      success: false,
      message: "report id and doctorId are required",
    });
  }

  try {
    const report = await PatientReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (String(report.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Use $pull for an atomic removal of the share entry.
    const updateResult = await PatientReport.updateOne(
      { _id: reportId, "sharedWith.doctorId": String(doctorId) },
      { $pull: { sharedWith: { doctorId: String(doctorId) } } },
    );

    if (!updateResult || updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Share not found",
      });
    }

    const updated = await PatientReport.findById(reportId);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid report id",
    });
  }
};
