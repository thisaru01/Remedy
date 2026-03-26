import jwt from "jsonwebtoken";

const trimQuotes = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/^"|"$/g, "").trim();
};

const normalizePrivateKey = (rawValue) => {
  // Remove quotes and trim
  let normalized = trimQuotes(rawValue);

  // Handle escaped newlines: \n -> actual newline
  normalized = normalized.replace(/\\n/g, "\n");

  // Handle Windows line endings and extra whitespace
  normalized = normalized.replace(/\r\n/g, "\n");

  // Remove extra whitespace within lines but preserve structure
  normalized = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return normalized;
};

const hasAnyJaasCredential = () => {
  return ["JAAS_APP_ID", "JAAS_KEY_ID", "JAAS_PRIVATE_KEY"].some(
    (envName) => Boolean((process.env[envName] || "").trim()),
  );
};

export const isJaasEnabled = () => {
  const explicit = (process.env.JAAS_ENABLED || "").trim().toLowerCase();
  if (explicit === "true") {
    return true;
  }
  if (explicit === "false") {
    return false;
  }
  return hasAnyJaasCredential();
};

export const getJaasConfig = () => {
  const appId = trimQuotes(process.env.JAAS_APP_ID || "");
  const keyId = trimQuotes(process.env.JAAS_KEY_ID || "");
  const privateKey = normalizePrivateKey(process.env.JAAS_PRIVATE_KEY || "");
  const domain = trimQuotes(process.env.JAAS_DOMAIN || "") || "8x8.vc";

  return {
    appId,
    keyId,
    privateKey,
    domain,
  };
};

export const validateJaasConfig = () => {
  if (!isJaasEnabled()) {
    return;
  }

  const { appId, keyId, privateKey, domain } = getJaasConfig();
  const missing = [];

  if (!appId) missing.push("JAAS_APP_ID");
  if (!keyId) missing.push("JAAS_KEY_ID");
  if (!privateKey) missing.push("JAAS_PRIVATE_KEY");
  if (!domain) missing.push("JAAS_DOMAIN");

  if (missing.length > 0) {
    throw new Error(`Missing required JaaS configuration: ${missing.join(", ")}`);
  }

  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    throw new Error("JAAS_PRIVATE_KEY is not a valid PEM private key");
  }
};

export const buildJaasJoinUrl = (roomName) => {
  const { appId, domain } = getJaasConfig();
  return `https://${domain}/${appId}/${roomName}`;
};

export const mintJaasRoomToken = ({ roomName, user }) => {
  const { appId, keyId, privateKey } = getJaasConfig();

  const moderator = String(user.role).toLowerCase() === "doctor";

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: appId,
    room: roomName,
    context: {
      user: {
        id: String(user.id),
        name: String(user.name || user.id),
        moderator,
      },
    },
  };

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "10m",
    header: {
      kid: keyId,
      typ: "JWT",
    },
  });
};
