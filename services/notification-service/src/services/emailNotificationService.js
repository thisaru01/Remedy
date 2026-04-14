import {
  getEmailTransporter,
  getDefaultFromAddress,
} from "../config/emailConfig.js";
import {
  renderPatientAppointmentEmail,
  renderDoctorAppointmentEmail,
} from "../templates/appointmentConfirmationTemplate.js";

export class EmailNotificationService {
  constructor(
    transporter = getEmailTransporter(),
    defaultFrom = getDefaultFromAddress(),
  ) {
    this.transporter = transporter;
    this.defaultFrom = defaultFrom;
  }

  async sendPatientAppointmentPending({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Appointment booking successful - pending approval";
    const text = `Hi ${patientName || "there"}, your appointment booking is successful and pending your doctor's approval.${
      appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""
    }`;

    const html = renderPatientAppointmentEmail({
      patientName,
      doctorName,
      appointmentDateTime,
      appointmentNumber,
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

  async sendDoctorNewAppointment({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "New appointment request";
    const text = `Hi ${
      doctorName || "Doctor"
    }, you have received a new appointment request from ${
      patientName || "a patient"
    }.${appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""} Please review and take action.`;

    const html = renderDoctorAppointmentEmail({
      patientName,
      doctorName,
      appointmentDateTime,
      appointmentNumber,
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
