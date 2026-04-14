import express from "express";
import { checkSymptoms } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/symptom-check
router.post("/", checkSymptoms);

export default router;
