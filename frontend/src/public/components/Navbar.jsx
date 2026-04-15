import { Link, useNavigate } from "react-router-dom";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useAuth } from "@/context/auth/useAuth";
import { getDashboardPathForRole } from "@/context/auth/authRouting";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role, user, signOut } = useAuth();

  const dashboardPath = getDashboardPathForRole(role);

  const displayName = user?.name || "Account";
  const profilePhoto = user?.profilePhoto || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-2">
        <Link
          to="/"
          className="flex items-center gap-2 py-1 text-xl font-bold text-blue-600"
        >
          <span>Remedy</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/book-appointments">Book Appointments</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/remedy-ai">Remedy AI</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link to="/#contact-us">Contact Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0">
              <div className="border-b border-border p-4">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-base font-semibold text-foreground"
                >
                  <span>Remedy</span>
                </Link>
              </div>

              <div className="p-2">
                <div className="grid gap-1">
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Home
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/book-appointments"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Book Appointments
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/remedy-ai"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Remedy AI
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/#contact-us"
                      className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Contact Us
                    </Link>
                  </SheetClose>
                </div>
              </div>

              <div className="mt-auto border-t border-border p-4">
                {!isAuthenticated ? (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link
                        to="/auth"
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground"
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/auth"
                        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        Get started
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Link
                        to={dashboardPath}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Avatar size="sm">
                          <AvatarImage src={profilePhoto} alt={displayName} />
                          <AvatarFallback>{initials || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{displayName}</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                      >
                        Log out
                      </button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {!isAuthenticated ? (
            <>
              <Link
                to="/auth"
                className="hidden rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground lg:inline-flex"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="hidden rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 lg:inline-flex"
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="hidden lg:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="cursor-pointer gap-2 hover:bg-transparent focus:bg-transparent"
                  >
                    <Avatar size="sm">
                      <AvatarImage src={profilePhoto} alt={displayName} />
                      <AvatarFallback>{initials || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-40 truncate text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath}>Dashboard</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(event) => {
                        event.preventDefault();
                        handleSignOut();
                      }}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
