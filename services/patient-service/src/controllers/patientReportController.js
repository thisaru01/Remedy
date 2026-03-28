import PatientReport from "../models/patientReportModel.js";

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

  const reports = await PatientReport.find({ userId }).sort({ createdAt: -1 });

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

    if (!isPatientOwner && !isDoctorShared) {
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
