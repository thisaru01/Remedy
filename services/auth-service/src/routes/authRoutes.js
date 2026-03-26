import express from "express";
import { login, register, verifyToken } from "../controllers/authController.js";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", internalAuthMiddleware, verifyToken);

export default router;
