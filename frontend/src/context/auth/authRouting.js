export function getDashboardPathForRole(role) {
  switch (role) {
    case "patient":
      return "/";
    case "doctor":
      return "/";
    case "admin":
      return "/admin";
    default:
      return "/auth";
  }
}
