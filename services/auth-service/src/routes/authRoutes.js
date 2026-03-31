import express from "express";
import {
  getUsers,
  login,
  register,
  updateUserStatus,
  changeMyPassword,
} from "../controllers/authController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/me/password", protect, changeMyPassword);

// Admin endpoints
router.get("/users", protect, authorizeRoles("admin"), getUsers);
router.patch(
  "/users/:userId/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus,
);

export default router;
