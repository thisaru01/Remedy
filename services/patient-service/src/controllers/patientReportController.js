import PatientReport from "../models/patientReportModel.js";

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
