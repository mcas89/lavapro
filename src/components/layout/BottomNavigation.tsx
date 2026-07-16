import { NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const links = [
    { to: "/app/dashboard", icon: Home, label: "Início" },
    { to: "/app/pista", icon: CarFront, label: "Pista" },
    { to: "/app/agenda", icon: Calendar, label: "Agenda" },
    { to: "/app/financeiro", icon: DollarSign, label: "Financeiro" },
    { to: "?settingsMenu=true", icon: Menu, label: "Menu" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full h-16 border-t bg-background flex items-center justify-around z-40 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors",
                isActive && !link.to.includes("?") && "text-primary"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
