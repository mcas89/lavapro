import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

export function NewTeamMemberSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newMember") === "true";
  const { toast } = useToast();

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    role: "Funcionário",
    salaryType: "Mensal",
    salaryAmount: "",
    startDate: "",
    paymentDate: ""
  });

  // Limpar form quando fechar
  useEffect(() => {
    if (!isOpen) {
      setFormData({ 
        name: "", 
        email: "", 
        role: "Funcionário", 
        salaryType: "Mensal", 
        salaryAmount: "",
        startDate: "",
        paymentDate: ""
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    searchParams.delete("newMember");
    setSearchParams(searchParams);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;

    // Gerar iniciais
    const parts = formData.name.split(" ");
    let initial = formData.name.substring(0, 2).toUpperCase();
    if (parts.length > 1) {
      initial = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    db.addDoc("team", {
      ...formData,
      salaryAmount: formData.salaryAmount ? parseFloat(formData.salaryAmount.replace(",", ".")) : 0,
      initial
    });

    toast({
      title: "Membro adicionado",
      description: `${formData.name} foi adicionado à equipe com sucesso.`,
    });

    handleClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl px-4 pb-8 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-bold">Novo Membro</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Nome Completo</label>
            <Input 
              placeholder="Ex: Carlos Oliveira" 
              className="h-12 bg-muted/50"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">E-mail</label>
            <Input 
              type="email"
              placeholder="email@exemplo.com" 
              className="h-12 bg-muted/50"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Nível de Acesso</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({...formData, role: "Administrador"})}
                className={`h-12 rounded-xl border font-semibold text-sm transition-colors ${
                  formData.role === "Administrador" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                Administrador
              </button>
              <button
                onClick={() => setFormData({...formData, role: "Funcionário"})}
                className={`h-12 rounded-xl border font-semibold text-sm transition-colors ${
                  formData.role === "Funcionário" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                Funcionário
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.role === "Administrador" 
                ? "Pode acessar relatórios financeiros e configurações."
                : "Acesso apenas à agenda e ordens de serviço."}
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="text-sm font-semibold">Datas Importantes</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Data de Início</label>
                <Input 
                  type="date"
                  className="h-10 bg-muted/50"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Dia do Pagamento</label>
                <Input 
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 5" 
                  className="h-10 bg-muted/50"
                  value={formData.paymentDate || ""}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <label className="text-sm font-semibold">Remuneração Base</label>
            <div className="grid grid-cols-3 gap-2">
              {["Mensal", "Quinzenal", "Semanal"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({...formData, salaryType: type})}
                  type="button"
                  className={`h-10 rounded-lg border font-semibold text-xs transition-colors ${
                    formData.salaryType === type 
                      ? "bg-primary/20 text-primary border-primary/50" 
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="relative mt-2">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">R$</span>
              <Input 
                type="number"
                placeholder="0.00" 
                className="pl-9 h-10 bg-muted/50 font-medium"
                value={formData.salaryAmount}
                onChange={(e) => setFormData({...formData, salaryAmount: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Para registrar o pagamento na data certa, vá ao módulo Financeiro e lance a despesa.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-bold text-base" 
            onClick={handleSave}
            disabled={!formData.name || !formData.email}
          >
            Adicionar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
