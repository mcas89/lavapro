import { Outlet, Navigate } from "react-router";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu as MenuIcon, CarFront, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebase";
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

  // Verificação do Plano (Bloqueio SaaS)
  const isExpired = profileDoc?.validUntil && new Date() > new Date(profileDoc.validUntil);

  if (isExpired) {
    const handleLogout = async () => {
      await firebaseAuth.signOut();
      localStorage.removeItem("lavapro_auth");
      localStorage.removeItem("lavapro_onboarded");
      window.location.href = "/login";
    };

    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Renove seu plano</h1>
            <p className="text-muted-foreground">
              Seu período de acesso ao LavaPro expirou. Para continuar gerenciando seu lava-rápido sem interrupções, entre em contato para renovar sua assinatura.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              className="w-full h-12 text-base font-semibold"
              onClick={() => window.open(`https://wa.me/5531983919015?text=Olá! Gostaria de renovar a assinatura do meu Lava-Rápido no LavaPro.`, '_blank')}
            >
              Falar no WhatsApp
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-muted-foreground gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
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
