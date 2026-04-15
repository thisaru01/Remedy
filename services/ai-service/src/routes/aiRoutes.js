import express from "express";
import { checkSymptoms, getHistory } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/symptom-check
router.post("/", checkSymptoms);

// GET /api/ai/symptom-check/history
router.get("/history", getHistory);

export default router;
