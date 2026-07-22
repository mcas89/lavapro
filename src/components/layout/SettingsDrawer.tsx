import { useSearchParams, useNavigate } from "react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Store, LogOut, Info, Home, CarFront, Calendar, DollarSign, Users, Shield } from "lucide-react";

export function SettingsDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isOpen = searchParams.get("settingsMenu") === "true";

  const handleClose = () => {
    searchParams.delete("settingsMenu");
    setSearchParams(searchParams, { replace: true });
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  const links = [
    { to: "/app/dashboard", icon: Home, label: "Início" },
    { to: "/app/pista", icon: CarFront, label: "Pista" },
    { to: "/app/agenda", icon: Calendar, label: "Agenda" },
    { to: "/app/financeiro", icon: DollarSign, label: "Financeiro" },
    { to: "/app/clientes", icon: Users, label: "Clientes" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Menu Principal</SheetTitle>
          <SheetDescription>
            Acesse as funções, configurações e atalhos.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-4 overflow-y-auto space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Navegação Rápida</h3>
            
            <button
              onClick={() => handleNavigate("/app/configuracoes")}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
            >
              <Store className="h-4 w-4" />
              Meu Lava-Rápido
            </button>

            {links.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.to}
                  onClick={() => handleNavigate(link.to)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t space-y-1">
          <button
            onClick={async () => {
              try {
                const { signOut } = await import("firebase/auth");
                const { firebaseAuth } = await import("@/lib/firebase");
                await signOut(firebaseAuth);
              } catch (e) {
                console.error("Logout error", e);
              }
              localStorage.removeItem('lavapro_auth');
              handleNavigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            Sair do Sistema
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left">
                <Info className="h-4 w-4" />
                Sobre
              </button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[400px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Detalhes do LavaPro v1.0</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm leading-relaxed text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Criação do projeto</span>
                  <span>Supertech Soluções em Tecnologia</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Desenvolvedor Principal</span>
                  <span>Marcos Silva</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Ideias</span>
                  <span>Felipe Ramos</span>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <span className="font-semibold text-foreground block mb-3 text-center">Precisa de Ajuda?</span>
                  <button 
                    onClick={() => window.open("https://wa.me/5531983919015?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20aplicativo%20LavaPro.", "_blank")}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Falar com Suporte (WhatsApp)
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={() => handleNavigate("/termos")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
          >
            <Shield className="h-4 w-4" />
            Privacidade e Termos
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
