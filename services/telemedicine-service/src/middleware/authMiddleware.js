import axios from "axios";

// Protect Route — delegates JWT verification to the auth service
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    if (!authServiceUrl) {
      return res.status(500).json({
        success: false,
        message: "AUTH_SERVICE_URL is not configured",
      });
    }

    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;
    if (!internalToken) {
      return res.status(500).json({
        success: false,
        message: "INTERNAL_SERVICE_TOKEN is not configured",
      });
    }

    const response = await axios.get(
      `${authServiceUrl.replace(/\/$/, "")}/api/auth/verify`,
      {
        headers: {
          Authorization: authHeader,
          "x-internal-token": internalToken,
        },
        timeout: 5000,
      },
    );

    req.user = response.data.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// Role Authorization
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
