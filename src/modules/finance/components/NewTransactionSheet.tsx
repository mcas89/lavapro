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
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NewTransactionSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newTransaction") === "true";
  const editId = searchParams.get("editTransaction");
  const isEdit = !!editId;
  const isSheetOpen = isOpen || isEdit;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: searchParams.get("type") || "expense",
    description: "",
    category: searchParams.get("type") === "income" ? "Serviço" : "Produtos",
    value: "",
    date: new Date().toISOString().split("T")[0],
    isPaid: false
  });

  const categories = {
    income: ["Serviço", "Produto Adicional", "Gorjeta", "Outro"],
    expense: ["Produtos", "Folha de Pagamento", "Contas", "Impostos", "Equipamentos", "Outro"]
  };

  useEffect(() => {
    async function loadTransaction() {
      if (editId) {
        setLoading(true);
        const doc = await db.getDoc<any>("transactions", editId);
        if (doc) {
          setFormData({
            type: doc.type || "expense",
            description: doc.description || "",
            category: doc.category || "",
            value: doc.value?.toString() || "",
            date: doc.date || new Date().toISOString().split("T")[0],
            isPaid: doc.isPaid ?? false
          });
        }
        setLoading(false);
      }
    }

    if (isSheetOpen) {
      if (editId) {
        loadTransaction();
      } else {
        const t = searchParams.get("type") || "expense";
        setFormData({
          type: t,
          description: "",
          category: t === "income" ? "Serviço" : "Produtos",
          value: "",
          date: new Date().toISOString().split("T")[0],
          isPaid: true
        });
      }
    }
  }, [isSheetOpen, searchParams, editId]);

  const handleClose = () => {
    searchParams.delete("newTransaction");
    searchParams.delete("editTransaction");
    searchParams.delete("type");
    setSearchParams(searchParams);
  };

  const handleSave = async () => {
    if (!formData.description || !formData.value || !formData.date) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value.replace(",", "."))
      };

      if (isEdit && editId) {
        await db.updateDoc("transactions", editId, payload);
        toast({ title: "Atualizado", description: "O lançamento foi atualizado." });
      } else {
        await db.addDoc("transactions", payload);
        toast({ title: "Salvo", description: "Lançamento registrado com sucesso." });
      }
      handleClose();
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao salvar lançamento.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (confirm("Tem certeza que deseja excluir esta movimentação?")) {
      setLoading(true);
      try {
        await db.deleteDoc("transactions", editId);
        toast({ title: "Excluído", description: "Lançamento foi apagado." });
        handleClose();
      } catch (e) {
        toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl px-4 pb-8 overflow-y-auto">
        <SheetHeader className="mb-6 flex flex-row items-center justify-between mt-2">
          <SheetTitle className="text-left text-xl font-bold">{isEdit ? "Editar Lançamento" : "Novo Lançamento"}</SheetTitle>
          {isEdit && (
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </SheetHeader>

        <div className="space-y-5">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                onClick={() => setFormData({...formData, type: "income", category: "Serviço", isPaid: true})}
                className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
                  formData.type === "income" 
                    ? "bg-emerald-500 text-white border-emerald-500" 
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <ArrowUpCircle className="h-5 w-5" /> Entrada
              </button>
              <button
                onClick={() => setFormData({...formData, type: "expense", category: "Produtos", isPaid: true})}
                className={`h-12 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-colors ${
                  formData.type === "expense" 
                    ? "bg-red-500 text-white border-red-500" 
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <ArrowDownCircle className="h-5 w-5" /> Saída
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted-foreground font-semibold">R$</span>
              <Input 
                type="number"
                placeholder="0,00" 
                className="pl-12 h-14 bg-muted/50 font-bold text-lg"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
              />
            </div>
          </div>

          {formData.type === "expense" && (
            <div className="flex items-center justify-between border rounded-xl p-4 bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Lançamento Pago</Label>
                <p className="text-xs text-muted-foreground">Marque se já efetuou o pagamento</p>
              </div>
              <Switch 
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData({...formData, isPaid: checked})}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Descrição</label>
            <Input 
              placeholder="Ex: Compra de Shampoo 5L" 
              className="h-12 bg-muted/50"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Data</label>
            <Input 
              type="date"
              className="h-12 bg-muted/50"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {(formData.type === "income" ? categories.income : categories.expense).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    formData.category === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-bold text-base" 
            onClick={handleSave}
            disabled={!formData.description || !formData.value || !formData.date || loading}
          >
            {loading ? "Salvando..." : (isEdit ? "Atualizar" : "Lançar")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
