const internalAuthMiddleware = (req, res, next) => {
  const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({
      success: false,
      message: "INTERNAL_SERVICE_TOKEN is not configured",
    });
  }

  const providedToken = req.header("x-internal-token");
  if (!providedToken || providedToken !== expectedToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Optionally propagate user context from a trusted gateway/auth proxy.
  // This middleware does NOT validate JWTs; it only trusts internal calls.
  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");
  if (userId || role) {
    req.user = {
      ...(userId ? { id: userId } : {}),
      ...(role ? { role } : {}),
    };
  }

  return next();
};

export default internalAuthMiddleware;
