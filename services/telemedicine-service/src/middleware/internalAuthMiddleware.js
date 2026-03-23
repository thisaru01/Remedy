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

  return next();
};

export default internalAuthMiddleware;
