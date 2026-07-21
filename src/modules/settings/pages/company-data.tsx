import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Store, Crown, CalendarClock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";

export default function CompanyDataPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { data: settingsList, loading: settingsLoading } = useCollection<any>("settings");
  
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    address: "",
    phone: "",
  });

  const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");
  const validUntil = profileDoc?.validUntil ? new Date(profileDoc.validUntil) : null;
  const now = new Date();
  
  const isLifetime = !validUntil;
  const isExpired = validUntil ? now > validUntil : false;
  
  let daysDiff = 0;
  if (validUntil) {
    const diffTime = validUntil.getTime() - now.getTime();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    if (!settingsLoading && profileDoc && profileDoc.company) {
      setFormData({
        name: profileDoc.company.name || "",
        cnpj: profileDoc.company.cnpj || "",
        address: profileDoc.company.address || "",
        phone: profileDoc.company.phone || "",
      });
    }
  }, [settingsList, settingsLoading]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (profileDoc) {
        await db.updateDoc("settings", "profile", { company: formData });
      } else {
        await db.setDoc("settings", "profile", { company: formData });
      }

      toast({
        title: "Dados salvos",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <TopBar title="Dados da Empresa" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-6">
        
        {/* Card do Plano */}
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
          <Crown className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-300" /> Meu Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3 mb-1">
                {isLifetime ? (
                  <CheckCircle2 className="h-6 w-6 text-green-300" />
                ) : isExpired ? (
                  <ShieldAlert className="h-6 w-6 text-red-300" />
                ) : (
                  <CalendarClock className="h-6 w-6 text-blue-200" />
                )}
                <h3 className="font-bold text-lg">
                  {isLifetime ? "Vitalício (Pioneiro)" : isExpired ? "Plano Vencido" : "Plano Ativo"}
                </h3>
              </div>
              
              {!isLifetime && (
                <div className="mt-2 text-sm text-blue-100 flex justify-between items-center">
                  <span>
                    {isExpired 
                      ? "Seu acesso expirou." 
                      : `Faltam ${daysDiff} dia${daysDiff === 1 ? '' : 's'}`}
                  </span>
                  <span className="font-semibold bg-white/20 px-2 py-1 rounded">
                    Vence: {validUntil?.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>

            <Button 
              variant="secondary" 
              className="w-full font-bold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50 flex items-center justify-center gap-2"
              onClick={() => window.open("https://wa.me/5531983919015?text=Ol%C3%A1%2C%20gostaria%20de%20renovar%20minha%20assinatura%20do%20LavaPro.", "_blank")}
            >
              Renovar via WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Card de Dados da Empresa */}
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Informações Principais</h2>
                <p className="text-xs text-muted-foreground">Estes dados aparecem nos recibos e na agenda.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Nome do Lava-Rápido <span className="text-red-500">*</span></label>
              <Input 
                placeholder="Ex: Acqua Limp" 
                className="h-12"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">CNPJ <span className="text-muted-foreground font-normal">(Opcional)</span></label>
              <Input 
                placeholder="00.000.000/0000-00" 
                className="h-12"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">WhatsApp Comercial</label>
              <Input 
                placeholder="(11) 99999-9999" 
                className="h-12"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Endereço Completo</label>
              <Input 
                placeholder="Rua das Flores, 123" 
                className="h-12"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-14 text-lg font-bold rounded-xl"
          disabled={!formData.name || loading}
          onClick={handleSave}
        >
          {loading ? "Salvando..." : <><Save className="mr-2 h-5 w-5" /> Salvar Alterações</>}
        </Button>
      </div>
    </div>
  );
}
