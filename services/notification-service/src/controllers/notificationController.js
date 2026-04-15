import { emailNotificationService } from "../services/emailNotificationService.js";
import { smsNotificationService } from "../services/smsNotificationService.js";

class NotificationController {
  constructor(emailService, smsService) {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // POST /api/notifications/email/appointment-confirmation
  sendAppointmentEmail = async (req, res) => {
    const {
      to,
      phoneTo,
      recipientType,
      patientName,
      doctorName,
      appointmentDateTime,
      appointmentNumber,
    } = req.body;

    try {
      if (recipientType === "doctor") {
        await this.emailService.sendDoctorNewAppointment({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      } else if (recipientType === "patient-accepted") {
        await this.emailService.sendPatientAppointmentAccepted({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      } else if (recipientType === "patient-completed") {
        await this.emailService.sendPatientAppointmentCompleted({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      } else if (recipientType === "doctor-completed") {
        await this.emailService.sendDoctorAppointmentCompleted({
          to,
          patientName,
          doctorName,
          appointmentDateTime,
          appointmentNumber,
        });
      } else if (recipientType === "doctor-payment-success") {
        await this.emailService.sendDoctorPaymentSuccess({
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
    } catch (error) {
      console.error("Error sending appointment EMAIL:", {
        recipientType,
        to,
        message: error?.message,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to send appointment confirmation email",
      });
    }

    // SMS is best-effort: never fail the request if SMS sending fails
    if (phoneTo) {
      try {
        if (recipientType === "doctor") {
          await this.smsService.sendDoctorNewAppointmentSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        } else if (recipientType === "patient-accepted") {
          await this.smsService.sendPatientAppointmentAcceptedSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        } else if (recipientType === "patient-completed") {
          await this.smsService.sendPatientAppointmentCompletedSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        } else if (recipientType === "doctor-completed") {
          await this.smsService.sendDoctorAppointmentCompletedSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        } else if (recipientType === "doctor-payment-success") {
          await this.smsService.sendDoctorPaymentSuccessSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        } else {
          await this.smsService.sendPatientAppointmentPendingSms({
            to: phoneTo,
            patientName,
            doctorName,
            appointmentDateTime,
            appointmentNumber,
          });
        }
      } catch (error) {
        console.warn("Error sending appointment SMS (ignored):", {
          recipientType,
          phoneTo,
          status: error?.status,
          code: error?.code,
          message: error?.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Appointment notification processed",
    });
  };
}

export const notificationController = new NotificationController(
  emailNotificationService,
  smsNotificationService,
);
