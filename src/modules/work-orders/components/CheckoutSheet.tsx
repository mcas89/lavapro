import { useState, useEffect } from "react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { useCollection } from "@/hooks/useCollection";

interface CheckoutSheetProps {
  vehicleId: string | null;
  onClose: () => void;
}

export function CheckoutSheet({ vehicleId, onClose }: CheckoutSheetProps) {
  const { toast } = useToast();
  const { data: workOrders } = useCollection<any>("workOrders");
  const { data: services } = useCollection<any>("services");
  const { data: vehicles } = useCollection<any>("vehicles");
  const { data: customers } = useCollection<any>("customers");
  const { data: teamMembers } = useCollection<any>("team");
  const { data: settingsList } = useCollection<any>("settings");

  const [method, setMethod] = useState<"Pix" | "Cartão" | "Dinheiro">("Pix");
  const [value, setValue] = useState("");

  // Work order atual
  const workOrder = workOrders.find((v: any) => v.id === vehicleId);

  // Dados relacionados
  const vehicle = vehicles.find((v: any) => v.id === workOrder?.vehicleId);
  const customer = customers.find((c: any) => c.id === workOrder?.customerId);

  // Nome do atendente: primeiro funcionário da equipe, ou nome do lava-rápido
  const profileDoc = settingsList?.find((doc: any) => doc.id === "profile");
  const companyName = profileDoc?.company?.name || "Lava-Rápido";
  const attendant = teamMembers?.[0]?.name || companyName;

  // Inicializar valor com preço do serviço
  useEffect(() => {
    if (workOrder) {
      const srv = services.find((s: any) => s.id === workOrder.serviceId || s.name === workOrder.service);
      if (srv?.price) {
        setValue(Number(srv.price).toFixed(2));
      } else {
        setValue("80.00");
      }
    }
  }, [workOrder, services]);

  const handleFinishCheckout = () => {
    if (!workOrder) return;

    const amount = parseFloat(value.replace(",", "."));
    const plate = vehicle?.plate || "N/D";
    const vehicleDesc = vehicle ? `${vehicle.brand} ${vehicle.model}` : "Veículo";

    // 1. Criar transação financeira
    db.addDoc("transactions", {
      type: "income",
      description: `Lavagem - ${plate} (${vehicleDesc})`,
      category: "Serviço",
      value: amount,
      paymentMethod: method,
      attendant,
      customerId: workOrder.customerId,
      vehicleId: workOrder.vehicleId,
      isPaid: true,
      date: new Date().toISOString().split("T")[0]
    });

    // 2. Remover da pista
    db.deleteDoc("workOrders", workOrder.id);

    toast({
      title: "Pagamento Concluído! ✅",
      description: `R$ ${amount.toFixed(2)} registrado no caixa via ${method}.`,
    });

    onClose();
  };

  return (
    <BottomSheet
      isOpen={!!vehicleId}
      onClose={onClose}
      title="Finalizar Atendimento"
    >
      <div className="pb-6 space-y-6">
        {/* Resumo do veículo/cliente */}
        <div className="bg-muted p-4 rounded-xl border space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">{vehicle?.plate || "—"}</h3>
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              {workOrder?.service || "Lavagem"}
            </span>
          </div>
          {vehicle && (
            <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} • {vehicle.color}</p>
          )}
          {customer && (
            <p className="text-sm font-medium text-foreground">{customer.name}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Atendente: <span className="font-medium text-foreground">{attendant}</span></p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Valor Total</Label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 font-bold text-muted-foreground">R$</span>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-12 text-xl font-bold h-14"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod("Pix")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-colors ${
                  method === "Pix" ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "hover:bg-muted"
                }`}
              >
                <QrCode className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Pix</span>
              </button>
              <button
                onClick={() => setMethod("Cartão")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-colors ${
                  method === "Cartão" ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "hover:bg-muted"
                }`}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Cartão</span>
              </button>
              <button
                onClick={() => setMethod("Dinheiro")}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-colors ${
                  method === "Dinheiro" ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" : "hover:bg-muted"
                }`}
              >
                <Banknote className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold">Dinheiro</span>
              </button>
            </div>
          </div>
        </div>

        <Button className="w-full h-14 text-lg font-bold rounded-xl mt-6" onClick={handleFinishCheckout}>
          Confirmar Pagamento
        </Button>
      </div>
    </BottomSheet>
  );
}
