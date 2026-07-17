import { useSearchParams } from "react-router";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, CarFront, CalendarClock, DollarSign, Plus } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

export function CustomerProfileSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerId = searchParams.get("customerProfile");
  const isOpen = !!customerId;

  const { data: allVehicles } = useCollection<any>("vehicles");
  const { data: allCustomers } = useCollection<any>("customers");
  const { data: allTransactions } = useCollection<any>("transactions");
  const { data: allSchedules } = useCollection<any>("schedules");
  
  const customer = allCustomers.find(c => c.id === customerId);
  const vehicles = allVehicles.filter(v => v.customerId === customerId);

  // Cálculo Dinâmico
  const customerTransactions = allTransactions.filter(t => t.customerId === customerId && t.type === 'income');
  const totalSpent = customerTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const customerSchedules = allSchedules.filter(s => s.customerId === customerId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastVisitRaw = customerSchedules.length > 0 ? customerSchedules[0].date : null;
  const lastVisit = lastVisitRaw ? lastVisitRaw.split("-").reverse().join("/") : "-";

  const handleClose = () => {
    searchParams.delete("customerProfile");
    setSearchParams(searchParams, { replace: true });
  };

  const openNewVehicle = () => {
    // Mantém o perfil aberto e adiciona newVehicle na URL para sobrepor
    searchParams.set("newVehicle", "true");
    if (customerId) {
      searchParams.set("targetCustomer", customerId);
    }
    setSearchParams(searchParams);
  };

  if (!customer && isOpen) return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Perfil">
      <div className="py-8 text-center text-muted-foreground">Carregando perfil...</div>
    </BottomSheet>
  );

  if (!customer) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Perfil do Cliente">
      <div className="pb-6 space-y-6">
        
        {/* Info Básica */}
        <div className="text-center space-y-2">
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center text-2xl font-bold uppercase">
            {customer.name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{customer.name}</h2>
          
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {customer.phone}</span>
            {customer.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {customer.address}</span>}
          </div>
        </div>

        {/* Resumo Financeiro / Frequência */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <CalendarClock className="h-6 w-6 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Última Visita</p>
              <p className="font-bold text-sm mt-1">{lastVisit}</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <DollarSign className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-xs text-muted-foreground">Total Gasto</p>
              <p className="font-bold text-sm mt-1">R$ {totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Garagem */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <CarFront className="h-4 w-4" /> Garagem ({vehicles.length})
            </h3>
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={openNewVehicle}>
              <Plus className="h-3 w-3" /> Add Carro
            </Button>
          </div>

          <div className="space-y-2">
            {vehicles.map((vehicle: any) => (
              <Card key={vehicle.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold uppercase">{vehicle.plate}</p>
                    <p className="text-xs text-muted-foreground capitalize">{vehicle.brand} {vehicle.model} {vehicle.color ? `• ${vehicle.color}` : ''}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => {
                      searchParams.set("editVehicle", vehicle.id);
                      setSearchParams(searchParams);
                    }}
                  >
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))}
            {vehicles.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-4 border rounded-xl border-dashed">
                Nenhum veículo cadastrado.
              </p>
            )}
          </div>
        </div>

      </div>
    </BottomSheet>
  );
}
