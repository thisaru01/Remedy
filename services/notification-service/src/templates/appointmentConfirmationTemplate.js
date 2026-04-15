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
const doctorBodyPath = path.join(__dirname, "doctorNewAppointment.hbs");

const layoutSource = fs.readFileSync(layoutPath, "utf8");
const patientBodySource = fs.readFileSync(patientBodyPath, "utf8");
const patientAcceptedBodySource = fs.readFileSync(
  patientAcceptedBodyPath,
  "utf8",
);
const doctorBodySource = fs.readFileSync(doctorBodyPath, "utf8");

const layoutTemplate = Handlebars.compile(layoutSource);
const patientBodyTemplate = Handlebars.compile(patientBodySource);
const patientAcceptedBodyTemplate = Handlebars.compile(
  patientAcceptedBodySource,
);
const doctorBodyTemplate = Handlebars.compile(doctorBodySource);

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
