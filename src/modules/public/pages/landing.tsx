import { useNavigate } from "react-router";
import { Download, CheckCircle2, Star, Shield, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDownload = async () => {
    if (deferredPrompt) {
      // Dispara o pop-up nativo de instalação do Chrome/Android
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        toast({
          title: "Instalando...",
          description: "O LavaPro está sendo adicionado à sua tela inicial."
        });
      }
    } else {
      // Se não for possível instalar nativamente (ex: Safari no iPhone ou já instalado)
      // Manda para o fluxo normal de criar conta / login.
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-slate-50 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img src="/lavapro.png" alt="LavaPro Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>
        <button 
          onClick={handleDownload}
          className="hidden md:flex items-center gap-2 text-sm font-semibold hover:text-blue-400 transition-colors"
        >
          Acessar Conta
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="container mx-auto px-6 pt-12 pb-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <Star className="h-4 w-4 fill-blue-400" />
          O sistema #1 para Lava-Rápidos
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Assuma o controle do seu <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            Lava-Rápido pelo celular
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Abandone o papel e a caneta. O LavaPro é um aplicativo completo para organizar a pista, comissionar funcionários e multiplicar seu lucro, direto na palma da mão.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={handleDownload}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/50 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="h-5 w-5" />
            Baixar App e Testar Grátis
          </button>
          <div className="flex flex-col items-center sm:items-start text-xs text-slate-400">
            <span className="font-semibold text-slate-300">7 Dias Totalmente Grátis</span>
            <span>Depois, apenas R$ 29,90/mês.</span>
          </div>
        </div>

        {/* MOCKUP IMAGE */}
        <div className="relative mx-auto max-w-4xl perspective-[2000px]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent z-10 bottom-[-2px]" />
          <img 
            src="/portifolio/interface.png" 
            alt="Interface do LavaPro" 
            className="w-full rounded-t-3xl md:rounded-t-[3rem] border border-slate-800 shadow-2xl shadow-blue-500/10 object-cover object-top h-[300px] md:h-[500px]"
          />
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo que você precisa em um só app</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Desenvolvido exclusivamente para as necessidades reais do dono de estética automotiva e lava-rápido.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feat 1 */}
            <div className="bg-[#020817] border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-colors group">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent z-10" />
                <img src="/portifolio/agenda.png" alt="Agenda" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Agenda Inteligente</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Controle os carros na pista em tempo real. Saiba quem está lavando, qual o serviço e quando estará pronto.
                </p>
              </div>
            </div>

            {/* Feat 2 */}
            <div className="bg-[#020817] border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-colors group">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent z-10" />
                <img src="/portifolio/empresa.png" alt="Configurações da Empresa" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão Completa</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Configure seus serviços, preços e dados do seu lava-rápido de forma simples. O sistema se adapta ao seu jeito de trabalhar.
                </p>
              </div>
            </div>

            {/* Feat 3 */}
            <div className="bg-[#020817] border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-colors group">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent z-10" />
                <img src="/portifolio/menu.png" alt="Menu Completo" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Na Palma da Mão</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Navegação rápida e fluida. Acesse financeiro, equipe, clientes e histórico de lavagens com apenas um toque, de qualquer lugar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING / CTA */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-[2.5rem] p-8 md:p-16 text-center backdrop-blur-sm">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para profissionalizar seu negócio?</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Cadastre-se hoje mesmo e baixe o aplicativo no seu celular. Crie sua conta em 30 segundos e não pague nada pela primeira semana.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-6">
              <button 
                onClick={handleDownload}
                className="w-full sm:w-auto px-10 py-5 bg-white text-blue-950 hover:bg-slate-100 rounded-2xl font-bold text-xl shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95"
              >
                <Download className="h-6 w-6" />
                Criar Conta Grátis
              </button>
              
              <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-300 font-medium">
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sem compromisso
                </span>
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 7 dias de teste grátis
                </span>
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Apenas R$ 29,90 após o teste
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} LavaPro. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* FLOATING DOWNLOAD BUTTON (MOBILE FIXED) */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce sm:hidden">
        <button 
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-2xl shadow-blue-900/50 flex items-center justify-center border-2 border-white/20"
        >
          <Download className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
