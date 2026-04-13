import {
  getEmailTransporter,
  getDefaultFromAddress,
} from "../config/emailConfig.js";
import { renderAppointmentConfirmationEmail } from "../templates/appointmentConfirmationTemplate.js";

export class EmailNotificationService {
  constructor(
    transporter = getEmailTransporter(),
    defaultFrom = getDefaultFromAddress(),
  ) {
    this.transporter = transporter;
    this.defaultFrom = defaultFrom;
  }

  async sendAppointmentConfirmation({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    channel = "email",
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Your appointment is confirmed";

    const text = `Hello ${patientName || "there"}, your appointment has been confirmed.`;

    const html = renderAppointmentConfirmationEmail({
      patientName,
      doctorName,
      appointmentDateTime,
    });

    const mailOptions = {
      from: this.defaultFrom,
      to,
      subject,
      text,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailNotificationService = new EmailNotificationService();
