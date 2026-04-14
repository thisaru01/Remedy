import express from "express";
import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import { getInternalUserById } from "../controllers/internalAuthController.js";

const router = express.Router();

router.get("/users/:id", internalAuthMiddleware, getInternalUserById);

export default router;
