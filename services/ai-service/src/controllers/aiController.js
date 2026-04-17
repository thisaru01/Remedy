import { generateSymptomAssessment } from "../services/aiService.js";
import AiAssessment from "../models/aiAssessmentModel.js";

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

    const userId = req.user?.id || null;
    const role = req.user?.role || null;

    if (userId) {
      try {
        await AiAssessment.create({
          userId,
          role,
          symptoms: symptoms.trim(),
          age: age || null,
          gender: gender || null,
          duration: duration || null,
          additionalInfo: additionalInfo || null,
          assessment,
        });
      } catch (persistError) {
        // eslint-disable-next-line no-console
        console.error("Failed to persist AI assessment", {
          message: persistError?.message,
          name: persistError?.name,
        });
      }
    }

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
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User context is missing for history lookup",
      });
    }

    const limitParam = Number.parseInt(req.query.limit, 10);
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50);

    const docs = await AiAssessment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const items = docs.map((doc) => ({
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      input: {
        symptoms: doc.symptoms,
        age: doc.age,
        gender: doc.gender,
        duration: doc.duration,
        additionalInfo: doc.additionalInfo,
      },
      assessment: doc.assessment,
    }));

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

export default { checkSymptoms, getHistory };
