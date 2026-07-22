import { Outlet, Navigate, NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu as MenuIcon, CarFront, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBlocked, isInGracePeriod, isExpiringSoon } from "@/services/planService";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { firebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
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
import { useNavigate, useLocation } from "react-router";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [companyName, setCompanyName] = useState("LavaPro");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      localStorage.removeItem('lavapro_onboarded');
      localStorage.removeItem('lavapro_auth');
      localStorage.removeItem('lavapro_company');
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

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

  // Se encontrou o profile no banco, significa que já fez onboarding
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

  // Aguarda carregar o banco antes de redirecionar
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

  const validUntil = profileDoc?.validUntil;
  const isUserBlocked = validUntil ? isBlocked(validUntil) : false;
  const isGracePeriod = validUntil ? isInGracePeriod(validUntil) : false;
  const isExpiring = validUntil ? isExpiringSoon(validUntil) : false;

  // Permite acesso à página de empresa para que o usuário possa renovar
  const isOnEmpresaPage = location.pathname === "/app/configuracoes/empresa";
  const isOnVerifyPage = location.pathname === "/app/verificar-pagamento";

  // Bloqueio total após período de graça
  if (isUserBlocked && !isOnEmpresaPage && !isOnVerifyPage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Lock className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Suspenso</h1>
        <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
          Seu período de acesso expirou. Escolha um plano abaixo para reativar o sistema agora mesmo, sem precisar falar com ninguém.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={() => navigate("/app/configuracoes/empresa")}
          >
            Ver Planos e Renovar Agora
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout}>
            Sair da Conta
          </Button>
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
      {/* Banner de período de graça (3 dias após vencimento) */}
      {isGracePeriod && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 flex items-center justify-between gap-2 shadow-lg">
          <p className="text-sm font-semibold">⚠️ Renove seu acesso — período de graça termina em breve</p>
          <Button
            size="sm"
            className="bg-white text-red-600 hover:bg-red-50 font-bold text-xs px-3 h-7 rounded-lg flex-shrink-0"
            onClick={() => navigate("/app/configuracoes/empresa")}
          >
            Renovar
          </Button>
        </div>
      )}

      {/* Banner de vencimento próximo */}
      {isExpiring && !isGracePeriod && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between gap-2 shadow-lg">
          <p className="text-sm font-semibold">⏰ Seu plano vence em breve</p>
          <Button
            size="sm"
            className="bg-white text-amber-600 hover:bg-amber-50 font-bold text-xs px-3 h-7 rounded-lg flex-shrink-0"
            onClick={() => navigate("/app/configuracoes/empresa")}
          >
            Renovar
          </Button>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className={cn(
        "hidden md:flex w-64 flex-col border-r bg-background h-screen sticky top-0 shrink-0",
        (isGracePeriod || isExpiring) ? "mt-10" : ""
      )}>
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
                className={({ isActive }: { isActive: boolean }) =>
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
      <main className={cn(
        "flex-1 flex flex-col min-w-0 bg-background md:bg-transparent relative h-screen overflow-y-auto",
        (isGracePeriod || isExpiring) ? "pt-10 md:pt-0" : ""
      )}>
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
