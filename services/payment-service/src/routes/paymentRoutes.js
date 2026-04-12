import express from "express";

import internalAuthMiddleware from "../middleware/internalAuthMiddleware.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentByAppointmentId,
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(internalAuthMiddleware);

router.post("/", createPayment);
router.get("/", getPayments);
router.get("/appointment/:appointmentId", getPaymentByAppointmentId);
router.get("/:id", getPaymentById);

export default router;
