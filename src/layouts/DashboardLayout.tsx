import { Outlet, Navigate } from "react-router";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu as MenuIcon, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewScheduleSheet } from "@/modules/schedule/components/NewScheduleSheet";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";
import { NewCustomerSheet } from "@/modules/customers/components/NewCustomerSheet";
import { CustomerProfileSheet } from "@/modules/customers/components/CustomerProfileSheet";
import { NewVehicleSheet } from "@/modules/customers/components/NewVehicleSheet";
import { NewServiceSheet } from "@/modules/services/components/NewServiceSheet";
import { NewTeamMemberSheet } from "@/modules/settings/components/NewTeamMemberSheet";
import { NewTransactionSheet } from "@/modules/finance/components/NewTransactionSheet";
import { useEffect, useState } from "react";
import { useCollection } from "@/hooks/useCollection";

export function DashboardLayout() {
  const [companyName, setCompanyName] = useState("LavaPro");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  useEffect(() => {
    const savedCompany = localStorage.getItem("lavapro_company");
    if (savedCompany) {
      try {
        const parsed = JSON.parse(savedCompany);
        if (parsed.name) setCompanyName(parsed.name);
      } catch (e) {}
    }
  }, []);

  const { data: settings, loading } = useCollection<any>("settings");
  
  const isOnboardedLocal = localStorage.getItem("lavapro_onboarded") === "true";
  const profileDoc = settings?.find((s: any) => s.id === "profile");
  
  // Se encontrou o profile no banco, significa que já fez onboarding (útil para login em novo dispositivo)
  if (profileDoc && !isOnboardedLocal) {
    localStorage.setItem("lavapro_onboarded", "true");
  }

  // Atualiza logo e tema a partir do banco
  useEffect(() => {
    if (profileDoc) {
      if (profileDoc.logo && !profileDoc.logo.startsWith('blob:')) setCompanyLogo(profileDoc.logo);
      if (profileDoc.company?.name) setCompanyName(profileDoc.company.name);
      if (profileDoc.theme) {
        document.documentElement.className = `theme-${profileDoc.theme}`;
        localStorage.setItem("lavapro_theme", profileDoc.theme);
      }
    }
  }, [profileDoc]);

  const isReallyOnboarded = isOnboardedLocal || !!profileDoc;

  // Se não está marcado como onboarded localmente, esperamos carregar o banco para ter certeza
  if (!isOnboardedLocal && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="animate-pulse text-muted-foreground font-medium">Sincronizando seus dados...</div>
      </div>
    );
  }
  
  if (!isReallyOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  const links = [
    { to: "/app/dashboard", icon: Home, label: "Início" },
    { to: "/app/pista", icon: CarFront, label: "Pista" },
    { to: "/app/agenda", icon: Calendar, label: "Agenda" },
    { to: "/app/financeiro", icon: DollarSign, label: "Financeiro" },
    { to: "/app/clientes", icon: Users, label: "Clientes" },
    { to: "?settingsMenu=true", icon: MenuIcon, label: "Menu" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background h-screen sticky top-0 shrink-0">
        <div className="h-14 flex items-center px-6 border-b gap-3">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="h-8 w-auto max-w-[100px] object-contain" />
          ) : null}
          <h1 className="text-xl font-bold text-primary">{companyName}</h1>
        </div>
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive && !link.to.includes("?")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background md:bg-transparent relative h-screen overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
      
      {/* Global Modals */}
      <NewScheduleSheet />
      <SettingsDrawer />
      <NewCustomerSheet />
      <CustomerProfileSheet />
      <NewVehicleSheet />
      <NewServiceSheet />
      <NewTeamMemberSheet />
      <NewTransactionSheet />
    </div>
  );
}
