import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

const NAV_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Home", to: "/" },
      { label: "Book appointments", to: "/book-appointments" },
      { label: "Remedy AI", to: "/remedy-ai" },
      { label: "Find a doctor", to: "/doctor" },
    ],
  },
  {
    title: "For patients",
    links: [
      { label: "My appointments", to: "/patient/appointments" },
      { label: "Prescriptions", to: "/patient/prescriptions" },
      { label: "Your account", to: "/auth" },
    ],
  },
  {
    title: "For professionals",
    links: [
      { label: "For doctors", to: "/doctor" },
      { label: "For admins", to: "/admin" },
      { label: "Telemedicine", to: "/telemedicine" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/#features" },
      { label: "Contact", to: "/#contact" },
      { label: "Support", to: "/#contact" },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  function navigateAndScrollToPath(e, to) {
    e.preventDefault();
    const target = to || "/";
    const parts = target.split("#");
    const base = parts[0] || "/";
    const id = parts[1];

    const navigateTo = base || "/";

    const performScroll = () => {
      if (id) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    if (location.pathname === navigateTo) {
      performScroll();
      return;
    }

    navigate(navigateTo);
    setTimeout(performScroll, 150);
  }

  const { role } = useAuth();
  const dashboardPath = getDashboardPathForRole(role) || "/dashboard";
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-black text-slate-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-10 border-b border-slate-800 pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3 sm:max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Remedy</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
              A unified platform connecting patients and doctors for
              appointments, prescriptions, and telemedicine.
            </p>
          </div>

          <div className="grid flex-1 gap-8 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {NAV_COLUMNS.map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((item) => {
                    if (item.to && item.to.includes("#")) {
                      return (
                        <li key={item.label}>
                          <a
                            href={item.to}
                            onClick={(e) => navigateAndScrollToPath(e, item.to)}
                            className="text-sm text-slate-200/80 transition-colors hover:text-white"
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    }

                    const to =
                      item.to === "/dashboard" ? dashboardPath : item.to;
                    return (
                      <li key={item.label}>
                        <Link
                          to={to}
                          onClick={(e) => navigateAndScrollToPath(e, to)}
                          className="text-sm text-slate-200/80 transition-colors hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 text-xs text-slate-400 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:text-[0.8rem]">
          <p className="max-w-xl leading-relaxed">
            Remedy is not a medical provider. It connects patients with licensed
            professionals and helps manage appointments and records.
          </p>

          <div className="space-y-2 text-right sm:text-left">
            <p className="text-slate-300">slremedyhealth@gmail.com</p>
            <p>© {year} Remedy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
