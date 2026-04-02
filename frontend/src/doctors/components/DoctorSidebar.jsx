import {
  CalendarClock,
  CalendarRange,
  ChevronRight,
  CircleUser,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { setAuthToken } from "@/context/auth/authStorage";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const defaultItems = [
  { title: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { title: "Profile", href: "/doctor/profile", icon: CircleUser },
  {
    title: "Appointments",
    href: "/doctor/appointments",
    icon: CalendarClock,
    children: [
      { title: "Pending", href: "/doctor/appointments/pending" },
      { title: "Approved", href: "/doctor/appointments/approved" },
      { title: "Paid", href: "/doctor/appointments/paid" },
      { title: "Completed", href: "/doctor/appointments/completed" },
      { title: "Rejected", href: "/doctor/appointments/rejected" },
    ],
  },
  {
    title: "Patient Reports",
    href: "/doctor/patient-reports",
    icon: FileText,
  },
  {
    title: "Schedule",
    href: "/doctor/schedule",
    icon: CalendarRange,
    children: [
      { title: "Create", href: "/doctor/schedule/create" },
      { title: "Manage", href: "/doctor/schedule/manage" },
    ],
  },
];

export function DoctorSidebar({ items = defaultItems, activeHref }) {
  const currentPath =
    activeHref ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  const navigate = useNavigate();
  const handleLogout = () => {
    setAuthToken(null);
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Stethoscope className="size-4" aria-hidden="true" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Remedy</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Doctor
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            if (item.children?.length) {
              const isGroupActive = item.children.some(
                (child) => child.href === currentPath,
              );
              const shouldOpen =
                isGroupActive ||
                item.children.some((child) =>
                  currentPath.startsWith(child.href),
                );

              return (
                <Collapsible
                  key={item.title}
                  defaultOpen={shouldOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isGroupActive}
                        tooltip={item.title}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const isActive = currentPath === child.href;

                          return (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={child.href}>
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            const isActive = currentPath === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link to={item.href}>
                    <Icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10"
            >
              <button type="button" onClick={handleLogout}>
                <LogOut aria-hidden="true" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} Remedy
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
