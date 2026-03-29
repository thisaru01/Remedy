import PatientReport from "../models/patientReportModel.js";
import { fetchAppointmentByIdForUser } from "../clients/appointmentClient.js";
import { cloudinary } from "../config/cloudinary.js";

// Upload a new patient report file and optionally link to an appointment
export const uploadPatientReportService = async ({ user, file, body }) => {
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

  if (!file) {
    return {
      status: 400,
      body: {
        success: false,
        message: "No file uploaded",
      },
    };
  }

  const title = (body?.title || "").trim();
  const description = body?.description;
  const appointmentId = body?.appointmentId;

  if (!title) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Title is required",
      },
    };
  }

  if (typeof appointmentId === "string" && appointmentId.trim()) {
    try {
      const appointment = await fetchAppointmentByIdForUser(
        appointmentId.trim(),
        { id: userId, role },
      );

      if (!appointment) {
        return {
          status: 404,
          body: {
            success: false,
            message: "Appointment not found",
          },
        };
      }

      const isPatientOwner =
        appointment.patientId &&
        (appointment.patientId.toString
          ? appointment.patientId.toString() === String(userId)
          : String(appointment.patientId) === String(userId));

      if (!isPatientOwner) {
        return {
          status: 403,
          body: {
            success: false,
            message: "You can only attach reports to your own appointments",
          },
        };
      }
    } catch (error) {
      const status = error?.response?.status || 502;
      const message =
        error?.response?.data?.message || "Failed to validate appointment";
      return {
        status,
        body: { success: false, message },
      };
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
    mimeType: file.mimetype,
    cloudinaryPublicId: file.filename,
    cloudinaryUrl: file.path,
  });

  return {
    status: 201,
    body: {
      success: true,
      data: report,
    },
  };
};

// Get all reports that belong to the authenticated patient
export const getMyPatientReportsService = async ({ user, query }) => {
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

  const appointmentId = (query?.appointmentId || "").trim();
  if (appointmentId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "appointmentId query parameter is not supported",
      },
    };
  }

  const filter = { userId };

  const reports = await PatientReport.find(filter).sort({ createdAt: -1 });

  return {
    status: 200,
    body: {
      success: true,
      data: reports,
    },
  };
};

// Get reports for a specific appointment, validating caller access
export const getReportsForAppointmentService = async ({ user, params }) => {
  const role = user?.role;
  if (role !== "doctor" && role !== "patient") {
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

  const appointmentId = (params?.appointmentId || "").trim();
  if (!appointmentId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "appointmentId is required",
      },
    };
  }

  try {
    const appointment = await fetchAppointmentByIdForUser(appointmentId, {
      id: userId,
      role,
    });

    if (!appointment) {
      return {
        status: 404,
        body: {
          success: false,
          message: "Appointment not found",
        },
      };
    }

    if (role === "doctor") {
      const isDoctorOwner =
        appointment.doctorId &&
        (appointment.doctorId.toString
          ? appointment.doctorId.toString() === String(userId)
          : String(appointment.doctorId) === String(userId));

      if (!isDoctorOwner) {
        return {
          status: 403,
          body: {
            success: false,
            message: "You can only view reports for your own appointments",
          },
        };
      }
    }

    if (role === "patient") {
      const isPatientOwner =
        appointment.patientId &&
        (appointment.patientId.toString
          ? appointment.patientId.toString() === String(userId)
          : String(appointment.patientId) === String(userId));

      if (!isPatientOwner) {
        return {
          status: 403,
          body: {
            success: false,
            message: "You can only view reports for your own appointments",
          },
        };
      }
    }

    const patientId = appointment.patientId
      ? appointment.patientId.toString
        ? appointment.patientId.toString()
        : String(appointment.patientId)
      : null;

    if (!patientId) {
      return {
        status: 500,
        body: {
          success: false,
          message: "Appointment is missing patient information",
        },
      };
    }

    const reports = await PatientReport.find({
      appointmentId,
      userId: patientId,
    }).sort({ createdAt: -1 });

    return {
      status: 200,
      body: {
        success: true,
        data: reports,
      },
    };
  } catch (error) {
    const status = error?.response?.status || 502;
    const message =
      error?.response?.data?.message || "Failed to validate appointment";
    return {
      status,
      body: { success: false, message },
    };
  }
};

// Delete a patient report owned by the authenticated patient
export const deletePatientReportService = async ({ user, params }) => {
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
  if (!reportId) {
    return {
      status: 400,
      body: {
        success: false,
        message: "Report id is required",
      },
    };
  }

  try {
    const report = await PatientReport.findById(reportId);
    if (!report) {
      return {
        status: 404,
        body: { success: false, message: "Report not found" },
      };
    }

    if (String(report.userId) !== String(userId)) {
      return {
        status: 403,
        body: { success: false, message: "Access denied" },
      };
    }

    try {
      if (report.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(String(report.cloudinaryPublicId), {
          resource_type: "auto",
        });
      }
    } catch (err) {}

    await PatientReport.deleteOne({ _id: reportId });

    return {
      status: 200,
      body: { success: true, message: "Report deleted" },
    };
  } catch (error) {
    return {
      status: 400,
      body: { success: false, message: "Invalid report id" },
    };
  }
};
