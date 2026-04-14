import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for email configuration`);
  }
  return value;
};

const gmailUser = requireEnv("GMAIL_USER");
const gmailPass = requireEnv("GMAIL_APP_PASSWORD");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

export const getEmailTransporter = () => transporter;

export const getDefaultFromAddress = () =>
  process.env.EMAIL_FROM || `Remedy <${gmailUser}>`;
