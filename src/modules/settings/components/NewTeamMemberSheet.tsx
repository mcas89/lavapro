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

import { useCollection } from "@/hooks/useCollection";

export function NewTeamMemberSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newMember") === "true";
  const editId = searchParams.get("editMember");
  const isEdit = !!editId;
  const isSheetOpen = isOpen || isEdit;

  const { toast } = useToast();
  const { data: team } = useCollection<any>("team");

  const [formData, setFormData] = useState<any>({
    name: "",
    phone: "",
    role: "Funcionário",
    salaryType: "Mensal",
    salaryAmount: "",
    startDate: "",
    paymentDate: ""
  });

  useEffect(() => {
    if (isSheetOpen) {
      if (isEdit && team.length > 0) {
        const member = team.find((m: any) => m.id === editId);
        if (member) {
          setFormData({
            name: member.name || "",
            phone: member.phone || "",
            role: member.role || "Funcionário",
            salaryType: member.salaryType || "Mensal",
            salaryAmount: member.salaryAmount || "",
            startDate: member.startDate || "",
            paymentDate: member.paymentDate || ""
          });
        }
      } else if (isOpen) {
        setFormData({ 
          name: "", 
          phone: "", 
          role: "Funcionário", 
          salaryType: "Mensal", 
          salaryAmount: "",
          startDate: "",
          paymentDate: ""
        });
      }
    }
  }, [isSheetOpen, isEdit, editId, team]);

  const handleClose = () => {
    searchParams.delete("newMember");
    searchParams.delete("editMember");
    setSearchParams(searchParams);
  };

  const handleSave = async () => {
    if (!formData.name) return;

    // Gerar iniciais
    const parts = formData.name.split(" ");
    let initial = formData.name.substring(0, 2).toUpperCase();
    if (parts.length > 1) {
      initial = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    const docData = {
      ...formData,
      salaryAmount: formData.salaryAmount ? parseFloat(formData.salaryAmount.toString().replace(",", ".")) : 0,
      initial
    };

    if (isEdit) {
      await db.updateDoc("team", editId, docData);
      toast({
        title: "Funcionário atualizado",
        description: `${formData.name} foi atualizado com sucesso.`,
      });
    } else {
      await db.addDoc("team", docData);
      toast({
        title: "Funcionário adicionado",
        description: `${formData.name} foi adicionado à equipe com sucesso.`,
      });
    }

    handleClose();
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl px-4 pb-8 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-bold">
            {isEdit ? "Editar Funcionário" : "Novo Funcionário"}
          </SheetTitle>
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
            <label className="text-sm font-semibold">Telefone</label>
            <Input 
              type="tel"
              placeholder="(11) 99999-9999" 
              className="h-12 bg-muted/50"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
              <Input 
                type="number"
                placeholder="Valor (Ex: 2500)" 
                className="h-12 pl-10 font-bold bg-muted/50"
                value={formData.salaryAmount || ""}
                onChange={(e) => setFormData({...formData, salaryAmount: e.target.value})}
              />
            </div>
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
                <label className="text-xs font-semibold text-muted-foreground">
                  {formData.salaryType === 'Semanal' ? 'Dia da Semana' : 'Dia do Pagamento'}
                </label>
                {formData.salaryType === 'Semanal' ? (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.paymentDate || "1"}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                  </select>
                ) : (
                  <Input 
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 5" 
                    className="h-10 bg-muted/50"
                    value={formData.paymentDate || ""}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  />
                )}
              </div>
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
          >
            {isEdit ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
