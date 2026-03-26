import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createSession,
  getSession,
  updateSessionStatus,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("doctor", "admin"), createSession);
router.get("/:id", protect, getSession);
router.patch("/:id/status", protect, authorizeRoles("doctor", "admin"), updateSessionStatus);

export default router;
