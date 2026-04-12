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

  const userId = req.header("x-user-id");
  const role = req.header("x-user-role");
  const name = req.header("x-user-name");
  if (!userId || !role) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: missing user context",
    });
  }

  req.user = {
    id: userId,
    name: name || "",
    role,
  };

  return next();
};

export default internalAuthMiddleware;
