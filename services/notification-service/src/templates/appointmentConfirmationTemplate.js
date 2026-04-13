import Handlebars from "handlebars";

const source = `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2 style="color: #2563eb;">Your appointment is confirmed</h2>
    <p>Hi {{#if patientName}}{{patientName}}{{else}}there{{/if}},</p>
    <p>
      Your appointment with
      {{#if doctorName}}{{doctorName}}{{else}}your doctor{{/if}}
      on <strong>{{appointmentDateTime}}</strong> has been confirmed.
    </p>
    <p>
      If you have any questions, please contact our support team.
    </p>
    <p>Best regards,<br/>The Remedy Team</p>
  </div>
`;

const template = Handlebars.compile(source);

export const renderAppointmentConfirmationEmail = (context) => {
  return template(context);
};
