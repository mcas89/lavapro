import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Car } from "lucide-react";
import type { Schedule } from "@/types/schedule";

interface AppointmentCardProps {
  schedule: Schedule;
  customerName?: string;
  vehicleInfo?: string;
  serviceName?: string;
  onClick?: (schedule: Schedule) => void;
}

export function AppointmentCard({ schedule, customerName, vehicleInfo, serviceName, onClick }: AppointmentCardProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
    "in-progress": { label: "Em Andamento", className: "bg-amber-100 text-amber-800" },
    in_progress: { label: "Em Andamento", className: "bg-amber-100 text-amber-800" },
    washing: { label: "Lavando", className: "bg-cyan-100 text-cyan-800" },
    drying: { label: "Secando", className: "bg-sky-100 text-sky-800" },
    completed: { label: "Finalizado", className: "bg-green-100 text-green-800" },
    ready: { label: "Pronto", className: "bg-emerald-100 text-emerald-800" },
    canceled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
  };

  // Fallback seguro para status desconhecidos
  const config = statusConfig[schedule.status] ?? { label: schedule.status || "–", className: "bg-muted text-muted-foreground" };

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-primary" onClick={() => onClick?.(schedule)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Clock className="h-4 w-4" />
            <span>{schedule.hour}</span>
          </div>
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        </div>
        
        <div className="space-y-1.5">
          {customerName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{customerName}</span>
            </div>
          )}
          {vehicleInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              <span>{vehicleInfo}</span>
            </div>
          )}
        </div>
        
        {serviceName && (
          <div className="mt-3 pt-3 border-t text-sm font-medium">
            {serviceName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
