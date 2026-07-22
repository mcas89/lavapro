import { Outlet, Navigate } from "react-router";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { NavLink } from "react-router";
import { Home, Calendar, Users, DollarSign, Menu as MenuIcon, CarFront, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useNavigate } from "react-router";

export function DashboardLayout() {
  const navigate = useNavigate();
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

  let isBlocked = false;
  if (profileDoc && profileDoc.validUntil) {
    const validUntilDate = new Date(profileDoc.validUntil + "T00:00:00");
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffDays = Math.round((today.getTime() - validUntilDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verifica se é período de teste (nunca fez pagamento) ou cliente pagante
    const isTrial = !profileDoc.paymentHistory || profileDoc.paymentHistory.length === 0;

    if (isTrial) {
      // Teste: Bloqueia imediatamente após o vencimento (Dia 8)
      if (diffDays > 0) {
        isBlocked = true;
      }
    } else {
      // Mensal: Bloqueia se o vencimento já passou de 3 dias (prazo de tolerância)
      if (diffDays > 3) {
        isBlocked = true;
      }
    }
  }

  if (isBlocked) {
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
