import { emailNotificationService } from "../services/emailNotificationService.js";

class NotificationController {
  constructor(emailService) {
    this.emailService = emailService;
  }

  // POST /api/notifications/email/appointment-confirmation
  sendAppointmentEmail = async (req, res) => {
    try {
      const {
        to,
        recipientType,
        patientName,
        doctorName,
        appointmentDateTime,
        appointmentNumber,
      } = req.body;

      if (recipientType === "doctor") {
        await this.emailService.sendDoctorNewAppointment({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      } else {
        // Default to patient-style email when recipientType is missing or "patient"
        await this.emailService.sendPatientAppointmentPending({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Appointment notification email sent",
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
