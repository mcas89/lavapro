import { Outlet } from "react-router";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AuthLayout() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verifica se já está instalado (PWA standalone) ou se já foi ocultado localmente
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isHiddenLocally = localStorage.getItem("lavapro_installed") === "true";
    
    if (isStandalone || isHiddenLocally) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
        localStorage.setItem("lavapro_installed", "true");
      }
    } else {
      // Se não tem prompt (Safari iOS por exemplo), apenas marcamos como lido/escondemos.
      setIsInstalled(true);
      localStorage.setItem("lavapro_installed", "true");
      toast({
        title: "Instalação não disponível",
        description: "Seu navegador pode não suportar a instalação ou o app já está instalado.",
      });
    }
  };

  const hidePrompt = () => {
    setIsInstalled(true);
    localStorage.setItem("lavapro_installed", "true");
  };

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-6">
        <div className="mb-6 flex justify-center">
          <img src="/lavapro.png" alt="LavaPro Logo" className="h-20 w-auto object-contain" />
        </div>
        <Outlet />
      </div>

      {/* Botão de Download */}
      {!isInstalled && (
        <div className="mt-8 text-center animate-in fade-in zoom-in duration-500 relative inline-block">
          <button 
            onClick={hidePrompt}
            className="absolute -top-3 -right-3 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full w-6 h-6 flex items-center justify-center z-10 text-xs shadow-sm"
          >
            ✕
          </button>
          <button 
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar Aplicativo
          </button>
        </div>
      )}
    </div>
  );
}
