import {
  getEmailTransporter,
  getDefaultFromAddress,
} from "../config/emailConfig.js";
import {
  renderPatientAppointmentEmail,
  renderPatientAppointmentAcceptedEmail,
  renderDoctorAppointmentEmail,
  renderPatientAppointmentCompletedEmail,
  renderDoctorAppointmentCompletedEmail,
  renderDoctorPaymentSuccessEmail,
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

  async sendPatientAppointmentAccepted({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Appointment approved";
    const text = `Hi ${patientName || "there"}, your appointment with ${
      doctorName || "your doctor"
    } for ${appointmentDateTime || "the scheduled time"} has been accepted.${
      appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""
    }`;

    const html = renderPatientAppointmentAcceptedEmail({
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

  async sendPatientAppointmentCompleted({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Appointment completed";
    const text = `Hi ${patientName || "there"}, your appointment with ${
      doctorName || "your doctor"
    } for ${
      appointmentDateTime || "the scheduled time"
    } has been marked as completed.${
      appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""
    }`;

    const html = renderPatientAppointmentCompletedEmail({
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

  async sendDoctorAppointmentCompleted({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Appointment marked as completed";
    const text = `Hi ${
      doctorName || "Doctor"
    }, the appointment with ${patientName || "a patient"} for ${
      appointmentDateTime || "the scheduled time"
    } has been marked as completed.${
      appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""
    }`;

    const html = renderDoctorAppointmentCompletedEmail({
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

  async sendDoctorPaymentSuccess({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) {
      throw new Error("Recipient email 'to' is required");
    }

    const subject = "Payment received for appointment";
    const text = `Hi ${
      doctorName || "Doctor"
    }, a payment has been recorded as successful for the appointment with ${
      patientName || "a patient"
    } for ${appointmentDateTime || "the scheduled time"}.${
      appointmentNumber ? ` Appointment number: ${appointmentNumber}.` : ""
    }`;

    const html = renderDoctorPaymentSuccessEmail({
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
