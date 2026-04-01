export function getDashboardPathForRole(role) {
  switch (role) {
    case "patient":
      return "/patient";
    case "doctor":
      return "/doctor";
    case "admin":
      return "/admin";
    default:
      return "/auth";
  }
}
