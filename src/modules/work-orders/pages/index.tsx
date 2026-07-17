import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CarFront, Check, Play, Droplets, Wind, Banknote } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useSearchParams } from "react-router";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { CheckoutSheet } from "../components/CheckoutSheet";
import { NewWorkOrderSheet } from "../components/NewWorkOrderSheet";

const STATUSES = [
  { id: "washing", label: "Lavando", icon: Droplets },
  { id: "drying", label: "Secando", icon: Wind },
  { id: "ready", label: "Pronto", icon: Check }
];

export default function WorkOrdersPage() {
  const { data: workOrders, loading } = useCollection<any>("workOrders");
  const { data: vehicles } = useCollection<any>("vehicles");
  const { data: customers } = useCollection<any>("customers");
  const [searchParams] = useSearchParams();
  // Abre direto na aba que vier via ?tab=, senão começa na Lavando
  const initialTab = searchParams.get("tab") || "washing";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [checkoutVehicleId, setCheckoutVehicleId] = useState<string | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const filteredOrders = workOrders.filter((wo: any) => wo.status === activeTab);

  const advanceStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "washing" ? "drying" : "ready";
    db.updateDoc("workOrders", id, { status: nextStatus });
    setActiveTab(nextStatus);
  };

  return (
    <div className="pb-24 flex flex-col h-screen">
      <TopBar title="Pista de Lavagem" showBack={true} backTo="/app/dashboard" />

      {/* Tabs */}
      <div className="bg-background pt-2 px-2 border-b sticky top-14 z-10">
        <div className="flex w-full overflow-x-auto hide-scrollbar gap-2 pb-2">
          {STATUSES.map(status => {
            const Icon = status.icon;
            const count = workOrders.filter((wo: any) => wo.status === status.id).length;
            const isActive = activeTab === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setActiveTab(status.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {status.label}
                <span className={cn(
                  "ml-1 flex items-center justify-center h-5 w-5 rounded-full text-[10px]",
                  isActive ? "bg-white/20" : "bg-background text-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center">
            <CarFront className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p>Nenhum veículo nesta etapa.</p>
          </div>
        ) : (
          filteredOrders.map((wo: any) => {
            // Buscar dados reais do veículo e cliente pelo ID
            const vehicle = vehicles.find((v: any) => v.id === wo.vehicleId);
            const customer = customers.find((c: any) => c.id === wo.customerId);

            return (
              <Card key={wo.id} className="border-l-4 border-l-primary shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-none">
                        {vehicle?.plate || "Placa N/D"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Veículo não encontrado"}
                      </p>
                      {customer && (
                        <p className="text-xs text-primary font-medium mt-0.5">
                          {customer.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                        {wo.elapsedTime || "0 min"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-semibold">{wo.service || "Lavagem"}</span>

                    {wo.status !== "ready" ? (
                      <button
                        onClick={() => advanceStatus(wo.id, wo.status)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Play className="h-3 w-3" fill="currentColor" />
                        {wo.status === "queue" ? "Iniciar Lavagem" : wo.status === "washing" ? "Secar" : "Finalizar"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCheckoutVehicleId(wo.id)}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Banknote className="h-4 w-4" />
                        Checkout
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <FloatingActionButton
        icon={<Plus className="h-6 w-6" />}
        onClick={() => setIsNewOrderOpen(true)}
      />

      <CheckoutSheet
        vehicleId={checkoutVehicleId}
        onClose={() => setCheckoutVehicleId(null)}
      />
      <NewWorkOrderSheet
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}
