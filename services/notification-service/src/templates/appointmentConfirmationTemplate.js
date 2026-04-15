import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layoutPath = path.join(__dirname, "mainLayout.hbs");
const patientBodyPath = path.join(__dirname, "patientAppointmentPending.hbs");
const patientAcceptedBodyPath = path.join(
  __dirname,
  "patientAppointmentAccepted.hbs",
);
const patientCompletedBodyPath = path.join(
  __dirname,
  "patientAppointmentCompleted.hbs",
);
const doctorBodyPath = path.join(__dirname, "doctorNewAppointment.hbs");
const doctorCompletedBodyPath = path.join(
  __dirname,
  "doctorAppointmentCompleted.hbs",
);
const doctorPaymentSuccessBodyPath = path.join(
  __dirname,
  "doctorPaymentSuccess.hbs",
);

const layoutSource = fs.readFileSync(layoutPath, "utf8");
const patientBodySource = fs.readFileSync(patientBodyPath, "utf8");
const patientAcceptedBodySource = fs.readFileSync(
  patientAcceptedBodyPath,
  "utf8",
);
const patientCompletedBodySource = fs.readFileSync(
  patientCompletedBodyPath,
  "utf8",
);
const doctorBodySource = fs.readFileSync(doctorBodyPath, "utf8");
const doctorCompletedBodySource = fs.readFileSync(
  doctorCompletedBodyPath,
  "utf8",
);
const doctorPaymentSuccessBodySource = fs.readFileSync(
  doctorPaymentSuccessBodyPath,
  "utf8",
);

const layoutTemplate = Handlebars.compile(layoutSource);
const patientBodyTemplate = Handlebars.compile(patientBodySource);
const patientAcceptedBodyTemplate = Handlebars.compile(
  patientAcceptedBodySource,
);
const patientCompletedBodyTemplate = Handlebars.compile(
  patientCompletedBodySource,
);
const doctorBodyTemplate = Handlebars.compile(doctorBodySource);
const doctorCompletedBodyTemplate = Handlebars.compile(
  doctorCompletedBodySource,
);
const doctorPaymentSuccessBodyTemplate = Handlebars.compile(
  doctorPaymentSuccessBodySource,
);

export const renderPatientAppointmentEmail = (context) => {
  const body = patientBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};

export const renderPatientAppointmentAcceptedEmail = (context) => {
  const body = patientAcceptedBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};

export const renderDoctorAppointmentEmail = (context) => {
  const body = doctorBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};

export const renderPatientAppointmentCompletedEmail = (context) => {
  const body = patientCompletedBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};

export const renderDoctorAppointmentCompletedEmail = (context) => {
  const body = doctorCompletedBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};

export const renderDoctorPaymentSuccessEmail = (context) => {
  const body = doctorPaymentSuccessBodyTemplate(context);
  return layoutTemplate({
    ...context,
    body,
    currentYear: context.currentYear || new Date().getFullYear(),
  });
};
