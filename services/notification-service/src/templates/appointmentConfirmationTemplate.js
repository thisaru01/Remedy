import Handlebars from "handlebars";

const patientSource = `
  <div style="background-color:#f3f4f6;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;font-family:Arial,sans-serif;color:#111827;">
      <div style="background-color:#1d4ed8;padding:18px 24px;text-align:center;color:#ffffff;font-size:22px;font-weight:600;">
        Remedy
      </div>
      <div style="padding:24px 24px 16px 24px;line-height:1.5;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#111827;">Your appointment request was received</h2>
        <p style="margin:0 0 12px 0;">Hi {{#if patientName}}{{patientName}}{{else}}there{{/if}},</p>
        <p style="margin:0 0 8px 0;">
          Your appointment request with
          {{#if doctorName}}{{doctorName}}{{else}}your doctor{{/if}}
          for <strong>{{appointmentDateTime}}</strong> was booked successfully.
        </p>
        {{#if appointmentNumber}}
        <p style="margin:0 0 8px 0;">
          Your appointment number is <strong>{{appointmentNumber}}</strong>. Please keep this for your records.
        </p>
        {{/if}}
        <p style="margin:0 0 8px 0;">
          It is currently <strong>pending doctor approval</strong>. You will receive an update once the doctor accepts or rejects this appointment.
        </p>
        <p style="margin:16px 0 0 0;">Best regards,<br/>The Remedy Team</p>
      </div>
      <div style="padding:16px 24px 20px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;text-align:center;">
        
        <div style="margin-bottom:4px;">&copy; 2026 Remedy. All rights reserved.</div>
        <div>This is an automated message. Please do not reply directly to this email.</div>
      </div>
    </div>
  </div>
`;

const doctorSource = `
  <div style="background-color:#f3f4f6;padding:24px 0;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;font-family:Arial,sans-serif;color:#111827;">
      <div style="background-color:#1d4ed8;padding:18px 24px;text-align:center;color:#ffffff;font-size:22px;font-weight:600;">
        Remedy
      </div>
      <div style="padding:24px 24px 16px 24px;line-height:1.5;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#111827;">New appointment request received</h2>
        <p style="margin:0 0 12px 0;">Hi {{#if doctorName}}{{doctorName}}{{else}}Doctor{{/if}},</p>
        <p style="margin:0 0 8px 0;">
          You have received a new appointment request from
          {{#if patientName}}{{patientName}}{{else}}a patient{{/if}}
          for <strong>{{appointmentDateTime}}</strong>.
        </p>
        {{#if appointmentNumber}}
        <p style="margin:0 0 8px 0;">
          Appointment number: <strong>{{appointmentNumber}}</strong>.
        </p>
        {{/if}}
        <p style="margin:0 0 8px 0;">
          Please review this appointment in the Remedy portal and take action (accept or reject) as soon as possible.
        </p>
        <p style="margin:16px 0 0 0;">Best regards,<br/>The Remedy Team</p>
      </div>
      <div style="padding:16px 24px 20px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;text-align:center;">
        <div style="margin-bottom:4px;">&copy; 2026 Remedy. All rights reserved.</div>
        <div>This is an automated message. Please do not reply directly to this email.</div>
      </div>
    </div>
  </div>
`;

const patientTemplate = Handlebars.compile(patientSource);
const doctorTemplate = Handlebars.compile(doctorSource);

export const renderPatientAppointmentEmail = (context) =>
  patientTemplate(context);

export const renderDoctorAppointmentEmail = (context) =>
  doctorTemplate(context);
