import { useState } from "react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";

interface NewWorkOrderSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewWorkOrderSheet({ isOpen, onClose }: NewWorkOrderSheetProps) {
  const { toast } = useToast();
  const { data: services } = useCollection<any>("services");
  
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    service: "Lavagem Simples"
  });

  const handleSave = () => {
    if (!formData.plate || !formData.brand || !formData.model) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    db.addDoc("workOrders", {
      ...formData,
      status: "queue",
      elapsedTime: "0 min",
    });

    toast({
      title: "Veículo na Fila",
      description: `${formData.plate} adicionado à pista de lavagem.`,
    });

    setFormData({ plate: "", brand: "", model: "", service: "Lavagem Simples" });
    onClose();
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nova Ordem de Serviço"
    >
      <div className="pb-6 space-y-5">
        <div className="space-y-2">
          <Label>Placa do Veículo</Label>
          <Input 
            placeholder="ABC-1234" 
            className="h-12 uppercase"
            value={formData.plate}
            onChange={(e) => setFormData({...formData, plate: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input 
              placeholder="Ex: Fiat" 
              className="h-12"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input 
              placeholder="Ex: Toro" 
              className="h-12"
              value={formData.model}
              onChange={(e) => setFormData({...formData, model: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Serviço</Label>
          <div className="grid grid-cols-2 gap-2">
            {(services.length > 0 ? services.map((s: any) => s.name) : ["Lavagem Simples", "Lavagem Completa", "Polimento", "Higienização"]).map((srv: string) => (
              <button
                key={srv}
                onClick={() => setFormData({...formData, service: srv})}
                className={`h-10 text-xs font-semibold rounded-lg border transition-colors ${
                  formData.service === srv
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                {srv}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl font-bold" 
            onClick={handleSave}
          >
            Adicionar à Pista
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
