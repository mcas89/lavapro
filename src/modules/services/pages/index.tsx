import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Info } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: services, loading } = useCollection<any>("services");

  const openNewService = () => {
    searchParams.set("newService", "true");
    setSearchParams(searchParams);
  };

  const editService = (id: string) => {
    searchParams.set("newService", "true");
    searchParams.set("serviceId", id);
    setSearchParams(searchParams);
  };

  return (
    <div className="pb-24">
      <TopBar title="Serviços" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tabela de Preços
          </h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {services.length} ativos
          </Badge>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Carregando...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Nenhum serviço cadastrado.</div>
          ) : (
            services.map((service: any) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => editService(service.id)}
            >
              <CardContent className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-base">{service.name}</h3>
                  <span className="font-black text-lg text-primary">
                    R$ {service.price.toFixed(2)}
                  </span>
                </div>
                
                {service.description && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mb-3 line-clamp-2">
                    <Info className="h-3 w-3 shrink-0 mt-0.5" />
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted w-fit px-2 py-1 rounded-md">
                  <Clock className="h-3 w-3" />
                  {service.estimatedTime || service.duration || 30} min
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>

      <FloatingActionButton 
        icon={<Plus className="h-6 w-6" />} 
        onClick={openNewService} 
      />
    </div>
  );
}
