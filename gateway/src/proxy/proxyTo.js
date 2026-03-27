import { createProxyMiddleware } from "http-proxy-middleware";

export const createProxyTo = ({ internalServiceToken }) => {
  return (target, { addUserContext, basePath }) => {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      timeout: 8000,
      proxyTimeout: 8000,
      pathRewrite:
        basePath !== undefined
          ? (path) => {
              if (path === "/" || path === "") return basePath;
              if (path.startsWith(basePath)) return path;
              return `${basePath}${path}`;
            }
          : undefined,
      on: {
        proxyReq: (proxyReq, req) => {
          if (addUserContext) {
            proxyReq.setHeader("x-internal-token", internalServiceToken);
            if (req.user?.id) proxyReq.setHeader("x-user-id", req.user.id);
            if (req.user?.name) proxyReq.setHeader("x-user-name", req.user.name);
            if (req.user?.role)
              proxyReq.setHeader("x-user-role", req.user.role);
          }
        },
        error: (err, req, res) => {
          if (res.headersSent) return;
          res.status(502).json({
            success: false,
            message: "Bad gateway",
          });
        },
      },
    });
  };
};
