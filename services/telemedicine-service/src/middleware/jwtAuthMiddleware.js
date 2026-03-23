import jwt from "jsonwebtoken";

// Extract token from header
const extractTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// Verify token
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const jwtAuthMiddleware = (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({
        success: false,
        message: "Internal server error during authentication",
      });
    }

    // Attach decoded user info to request
    req.user = verifyToken(token, secret);
    
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token validation failed",
    });
  }
};

export default jwtAuthMiddleware;
