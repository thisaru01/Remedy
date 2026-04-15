import { getSmsClient, getDefaultFromNumber } from "../config/smsConfig.js";

export class SmsNotificationService {
  constructor(client = getSmsClient(), defaultFrom = getDefaultFromNumber()) {
    this.client = client;
    this.defaultFrom = defaultFrom;
  }

  async sendPatientAppointmentPendingSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${patientName || "there"}, your appointment request with ${
      doctorName || "your doctor"
    } for ${
      appointmentDateTime || "the scheduled time"
    } is booked and pending doctor approval.${
      appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""
    }`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }

  async sendPatientAppointmentAcceptedSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${patientName || "there"}, your appointment with ${
      doctorName || "your doctor"
    } for ${appointmentDateTime || "the scheduled time"} has been accepted.${
      appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""
    }`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }

  async sendDoctorNewAppointmentSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${doctorName || "Doctor"}, new appointment request from ${
      patientName || "a patient"
    } for ${
      appointmentDateTime || "the scheduled time"
    }.${appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""}`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }

  async sendPatientAppointmentCompletedSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${patientName || "there"}, your appointment with ${
      doctorName || "your doctor"
    } for ${
      appointmentDateTime || "the scheduled time"
    } has been marked completed.${
      appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""
    }`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }

  async sendDoctorAppointmentCompletedSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${doctorName || "Doctor"}, appointment with ${
      patientName || "a patient"
    } for ${
      appointmentDateTime || "the scheduled time"
    } has been marked completed.${
      appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""
    }`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }

  async sendDoctorPaymentSuccessSms({
    to,
    patientName,
    doctorName,
    appointmentDateTime,
    appointmentNumber,
  }) {
    if (!to) return;

    const body = `Hi ${
      doctorName || "Doctor"
    }, payment successful for appointment with ${
      patientName || "a patient"
    } for ${
      appointmentDateTime || "the scheduled time"
    }.${appointmentNumber ? ` Appt: ${appointmentNumber}.` : ""}`;

    await this.client.messages.create({
      from: this.defaultFrom,
      to,
      body,
    });
    console.info(`SMS sent to ${to}`);
  }
}

export const smsNotificationService = new SmsNotificationService();
