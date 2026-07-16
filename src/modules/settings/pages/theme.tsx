import { useState, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Palette, Check, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";

export default function ThemePage() {
  const { toast } = useToast();
  const [, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [theme, setTheme] = useState("blue");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: settingsList, loading: settingsLoading } = useCollection<any>("settings");

  useEffect(() => {
    if (!settingsLoading && settingsList) {
      const profileDoc = settingsList.find((doc: any) => doc.id === "profile");
      if (profileDoc) {
        if (profileDoc.theme) setTheme(profileDoc.theme);
        if (profileDoc.logo && !profileDoc.logo.startsWith("blob:")) {
          setLogoPreview(profileDoc.logo);
        }
      }
    }
  }, [settingsList, settingsLoading]);

  // Comprime a imagem para no máximo 300x300 e 80% de qualidade → ~5–20KB em base64
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
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file);
      setLogoPreview(compressed);

      // Salva base64 comprimida (<20KB) direto no Firestore — sem Storage
      const profile = await db.getDoc<any>("settings", "profile");
      if (profile) {
        await db.updateDoc("settings", "profile", { logo: compressed });
      } else {
        await db.setDoc("settings", "profile", { logo: compressed, theme });
      }

      toast({ title: "Logo salvo!", description: "Logotipo atualizado com sucesso." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro no upload", description: "Não foi possível salvar o logo.", variant: "destructive" });
    } finally {
      setUploadingLogo(false);
    }
  };

  const themes = [
    { id: "blue", name: "Azul", color: "bg-blue-600" },
    { id: "red", name: "Vermelho", color: "bg-red-600" },
    { id: "green", name: "Verde", color: "bg-emerald-600" },
    { id: "purple", name: "Roxo", color: "bg-purple-600" },
    { id: "orange", name: "Laranja", color: "bg-orange-600" },
    { id: "zinc", name: "Cinza", color: "bg-zinc-900 dark:bg-zinc-100" },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const profile = await db.getDoc<any>("settings", "profile");
      const updateData = { theme, logo: logoPreview || null };
      
      if (profile) {
        await db.updateDoc("settings", "profile", updateData);
      } else {
        await db.setDoc("settings", "profile", updateData);
      }
      
      document.documentElement.className = `theme-${theme}`;
      toast({
        title: "Identidade atualizada",
        description: "Logotipo e cores do aplicativo foram salvos com sucesso.",
      });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível salvar as preferências.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <TopBar title="Logotipo e Tema" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-6">
        <Card className="border-none shadow-sm bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Identidade Visual</h2>
                <p className="text-xs text-muted-foreground">Personalize a cara do seu aplicativo.</p>
              </div>
            </div>

            {/* Upload Logo */}
            <div className="space-y-4 pt-4 border-t">
              <label className="text-sm font-semibold">Logotipo da Empresa</label>
              <div className="h-32 w-32 rounded-xl border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-muted-foreground bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden group">
                {uploadingLogo ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-semibold text-primary">Enviando...</span>
                  </div>
                ) : logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 mb-2 text-primary" />
                    <span className="text-xs font-semibold">Fazer Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={handleLogoUpload}
                />
              </div>
              {logoPreview && !uploadingLogo && (
                <p className="text-xs text-emerald-600 font-medium">✓ Logo carregado com sucesso</p>
              )}
            </div>

            {/* Tema */}
            <div className="space-y-4 pt-4 border-t">
              <label className="text-sm font-semibold">Cor Principal do Aplicativo</label>
              <div className="flex flex-wrap gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      // Aplica a cor em tempo real apenas para visualização prévia
                      document.documentElement.className = `theme-${t.id}`;
                    }}
                    className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${t.color} ${theme === t.id ? 'ring-4 ring-offset-4 ring-primary scale-110 shadow-lg' : 'hover:scale-105 opacity-80'}`}
                  >
                    {theme === t.id && <Check className="h-7 w-7 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full h-14 text-lg font-bold rounded-xl"
          onClick={handleSave}
        >
          <Save className="mr-2 h-5 w-5" /> Salvar Preferências
        </Button>
      </div>
    </div>
  );
}
