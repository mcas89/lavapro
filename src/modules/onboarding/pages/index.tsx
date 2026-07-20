import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Palette, ArrowRight, Check, Upload, Clock, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { mockBusinessHours } from "@/modules/dashboard/utils/mockData";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
  });

  const [theme, setTheme] = useState("blue");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Step 3 State
  const [defaultOpen, setDefaultOpen] = useState("08:00");
  const [defaultClose, setDefaultClose] = useState("18:00");
  const [services, setServices] = useState([
    { id: 1, name: "Lavagem Simples", price: "50" },
    { id: 2, name: "Lavagem Completa", price: "80" },
    { id: 3, name: "Polimento", price: "250" },
  ]);
  
  const themes = [
    { id: "blue", name: "Azul", color: "bg-blue-600" },
    { id: "red", name: "Vermelho", color: "bg-red-600" },
    { id: "green", name: "Verde", color: "bg-emerald-600" },
    { id: "purple", name: "Roxo", color: "bg-purple-600" },
    { id: "orange", name: "Laranja", color: "bg-orange-600" },
    { id: "zinc", name: "Cinza", color: "bg-zinc-900" },
  ];

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 300;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas error")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setLogoPreview(compressed);
      } catch (err) {
        console.error("Error compressing image", err);
      }
    }
  };

  const addService = () => {
    setServices([...services, { id: Date.now(), name: "", price: "" }]);
  };

  const removeService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: number, field: string, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleNext = async () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else {
      // Finalizar Onboarding
      // Calcula data de validade para 7 dias no futuro (período de testes)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);
      
      await db.setDoc("settings", "profile", {
        theme,
        company: formData,
        logo: logoPreview || null,
        validUntil: expirationDate.toISOString()
      });
      localStorage.setItem("lavapro_onboarded", "true");
      document.documentElement.className = `theme-${theme}`;

      // Salvar Horários (Agora é Assíncrono com Firebase)
      const bhList = await db.getCollection<any>("businessHours");
      const bh = bhList.length > 0 && Array.isArray(bhList[0].days) ? bhList[0] : mockBusinessHours;
      const newDays = bh.days.map((d: any) => 
        d.dayOfWeek !== 0 
          ? { ...d, openTime: defaultOpen, closeTime: defaultClose, isOpen: true } 
          : { ...d, isOpen: false }
      );
      
      // Limpa horários antigos para não duplicar (caso tenha vindo do seed)
      for (const oldBh of bhList) {
        if (oldBh.id) await db.deleteDoc("businessHours", oldBh.id);
      }
      
      // Salva como o único registro válido
      await db.addDoc("businessHours", { ...bh, days: newDays });

      // Salvar Serviços
      const oldServices = await db.getCollection<any>("services");
      for (const s of oldServices) {
        await db.deleteDoc("services", s.id!);
      }

      for (const s of services) {
        if (s.name.trim() !== "") {
          await db.addDoc("services", {
            name: s.name,
            price: parseFloat(s.price) || 0,
            description: "Serviço padrão",
            estimatedTime: 60
          });
        }
      }

      navigate("/app/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Store className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Palette className="h-5 w-5" />
            </div>
            <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            Passo {step} de 3
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black">Bem-vindo(a) ao LavaPro!</h1>
              <p className="text-muted-foreground">Vamos configurar o seu espaço de trabalho.</p>
            </div>

            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nome do Lava-Rápido <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="Ex: Acqua Limp" 
                    className="h-12 bg-background"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">CNPJ <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                  <Input 
                    placeholder="00.000.000/0000-00" 
                    className="h-12 bg-background"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">WhatsApp Comercial</label>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    className="h-12 bg-background"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Endereço Completo</label>
                  <Input 
                    placeholder="Rua das Flores, 123" 
                    className="h-12 bg-background"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-14 text-lg font-bold rounded-xl" disabled={!formData.name} onClick={handleNext}>
              Continuar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black">A Cara do Seu Negócio</h1>
              <p className="text-muted-foreground">Logotipo e cores do seu painel.</p>
            </div>

            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardContent className="p-6 space-y-6">
                {/* Upload Logo */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold block text-center">Logotipo da Empresa</label>
                  <div className="h-28 w-28 mx-auto rounded-full border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-muted-foreground bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mb-1 text-primary" />
                        <span className="text-[10px] font-semibold">Upload</span>
                      </>
                    )}
                    <input type="file" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  </div>
                </div>

                {/* Tema */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold block text-center">Tema de Cores</label>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${t.color} ${theme === t.id ? 'ring-4 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 opacity-80'}`}
                      >
                        {theme === t.id && <Check className="h-5 w-5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="h-14 px-6 rounded-xl font-bold" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button className="flex-1 h-14 text-lg font-bold rounded-xl" onClick={handleNext}>
                Continuar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black">Operação</h1>
              <p className="text-muted-foreground">Defina o básico para começar a trabalhar.</p>
            </div>

            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardContent className="p-6 space-y-6">
                
                {/* Horários */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Horário Padrão (Segunda a Sábado)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="time" 
                      value={defaultOpen}
                      onChange={(e) => setDefaultOpen(e.target.value)}
                      className="bg-background"
                    />
                    <span className="text-muted-foreground">até</span>
                    <Input 
                      type="time" 
                      value={defaultClose}
                      onChange={(e) => setDefaultClose(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Você poderá configurar exceções depois.</p>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Serviços */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Serviços Base</label>
                    <Button variant="ghost" size="sm" onClick={addService} className="h-8 px-2 text-primary">
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center gap-2">
                        <Input 
                          placeholder="Nome do serviço" 
                          value={service.name}
                          onChange={(e) => updateService(service.id, "name", e.target.value)}
                          className="bg-background"
                        />
                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">R$</span>
                          <Input 
                            type="number"
                            placeholder="0,00" 
                            value={service.price}
                            onChange={(e) => updateService(service.id, "price", e.target.value)}
                            className="bg-background pl-8"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeService(service.id)} className="text-muted-foreground hover:text-red-500 shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="h-14 px-6 rounded-xl font-bold" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button className="flex-1 h-14 text-lg font-bold rounded-xl" onClick={handleNext}>
                Finalizar <Check className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
