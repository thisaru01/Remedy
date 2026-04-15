import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required for SMS configuration`);
  }
  return value;
};

const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
const authToken = requireEnv("TWILIO_AUTH_TOKEN");

const client = twilio(accountSid, authToken);

export const getSmsClient = () => client;

export const getDefaultFromNumber = () => requireEnv("TWILIO_PHONE_NUMBER");
