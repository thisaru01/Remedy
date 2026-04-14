import { generateSymptomAssessment } from "../services/aiService.js";

export const checkSymptoms = async (req, res, next) => {
  try {
    const { symptoms, age, gender, duration, additionalInfo } = req.body || {};

    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "symptoms is required and must be a non-empty string",
      });
    }

    const assessment = await generateSymptomAssessment({
      symptoms,
      age,
      gender,
      duration,
      additionalInfo,
    });

    return res.status(200).json({
      success: true,
      assessment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    return next(error);
  }
};

export default { checkSymptoms };
