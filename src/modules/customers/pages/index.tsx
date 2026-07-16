import { useState } from "react";
import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Phone, CarFront, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/hooks/useCollection";

export default function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: customers, loading: loadingCustomers } = useCollection<any>("customers");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((c: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });
  const { data: vehicles } = useCollection<any>("vehicles");

  const openNewCustomer = () => {
    searchParams.set("newCustomer", "true");
    setSearchParams(searchParams);
  };

  const openCustomerProfile = (id: string) => {
    searchParams.set("customerProfile", id);
    setSearchParams(searchParams);
  };

  return (
    <div className="pb-24">
      <TopBar title="Clientes" showBack backTo="/app/dashboard" />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, telefone ou placa..." 
            className="pl-9 bg-background h-12 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Todos os Clientes
          </h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {filteredCustomers.length} cadastros
          </Badge>
        </div>

        <div className="space-y-3">
          {loadingCustomers ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Carregando...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">{searchQuery ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}</div>
          ) : (
            filteredCustomers.map((customer: any) => {
              const customerVehicles = vehicles.filter((v: any) => v.customerId === customer.id);
            
            return (
              <Card 
                key={customer.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => openCustomerProfile(customer.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base">{customer.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <CarFront className="h-3 w-3" />
                        {customerVehicles.length} veículo{customerVehicles.length !== 1 && 's'}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {customer.lastVisit}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
        </div>
      </div>

      <FloatingActionButton 
        icon={<UserPlus className="h-6 w-6" />} 
        onClick={openNewCustomer} 
      />
    </div>
  );
}
