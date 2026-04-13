import { emailNotificationService } from "../services/emailNotificationService.js";

class NotificationController {
  constructor(emailService) {
    this.emailService = emailService;
  }

  // POST /api/notifications/email/appointment-confirmation
  sendAppointmentEmail = async (req, res) => {
    try {
      const { to, patientName, doctorName, appointmentDateTime } = req.body;

      await this.emailService.sendAppointmentConfirmation({
        to,
        patientName,
        doctorName,
        appointmentDateTime,
      });

      return res.status(200).json({
        success: true,
        message: "Appointment confirmation email sent",
      });
    } catch (error) {
      console.error("Error sending appointment email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send appointment confirmation email",
      });
    }
  };
}

export const notificationController = new NotificationController(
  emailNotificationService,
);
