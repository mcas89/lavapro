import { useSearchParams } from "react-router";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, CarFront, CalendarClock, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";

export function CustomerProfileSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerId = searchParams.get("customerProfile");
  const isOpen = !!customerId;
  const { toast } = useToast();

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

  const openEditCustomer = () => {
    searchParams.set("newCustomer", "true");
    searchParams.set("editCustomer", customerId || "");
    setSearchParams(searchParams);
  };

  const handleDeleteCustomer = async () => {
    if (!customerId) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${customer?.name}? Esta ação não pode ser desfeita e os veículos associados também podem ser perdidos.`)) {
      try {
        await db.deleteDoc("customers", customerId);
        
        // Exclui os veículos associados ao cliente
        for (const v of vehicles) {
          if (v.id) await db.deleteDoc("vehicles", v.id);
        }

        toast({
          title: "Cliente excluído",
          description: "O cliente e seus veículos foram removidos.",
        });
        handleClose();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o cliente.",
          variant: "destructive"
        });
      }
    }
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
        <div className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0 flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={openEditCustomer}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleDeleteCustomer}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center text-2xl font-bold uppercase">
            {customer.name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold px-12">{customer.name}</h2>
          
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
