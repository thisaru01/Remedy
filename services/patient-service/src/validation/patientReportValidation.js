import mongoose from "mongoose";

export const validateReportIdFormat = (reportId) => {
  if (!mongoose.isValidObjectId(reportId)) {
    return {
      status: 400,
      body: { success: false, message: "Invalid report id" },
    };
  }
  return null;
};

export const parseExpiresAt = (expiresAtRaw) => {
  if (!expiresAtRaw) {
    return { expiresAt: null, error: null };
  }

  const parsed = new Date(expiresAtRaw);
  if (Number.isNaN(parsed.getTime())) {
    return {
      expiresAt: null,
      error: {
        status: 400,
        body: {
          success: false,
          message: "expiresAt must be a valid date",
        },
      },
    };
  }

  return { expiresAt: parsed, error: null };
};
