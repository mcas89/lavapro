import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Store } from "lucide-react";
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

  useEffect(() => {
    if (!settingsLoading && settingsList) {
      const profileDoc = settingsList.find((doc: any) => doc.id === "profile");
      if (profileDoc && profileDoc.company) {
        setFormData({
          name: profileDoc.company.name || "",
          cnpj: profileDoc.company.cnpj || "",
          address: profileDoc.company.address || "",
          phone: profileDoc.company.phone || "",
        });
      }
    }
  }, [settingsList, settingsLoading]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Usamos setDoc com merge implícito ou leitura prévia, mas como as settings tem logo e theme,
      // devemos atualizar apenas a chave company. O Firebase updateDoc faz partial updates se passarmos a chave.
      // Ou mais seguro, lemos e damos update.
      const profile = await db.getDoc<any>("settings", "profile");
      if (profile) {
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
          disabled={!formData.name}
          onClick={handleSave}
        >
          <Save className="mr-2 h-5 w-5" /> Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
