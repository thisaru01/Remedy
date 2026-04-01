export function getDashboardPathForRole(role) {
  switch (role) {
    case "patient":
      return "/patient";
    case "doctor":
      return "/";
    case "admin":
      return "/admin";
    default:
      return "/auth";
  }
}
