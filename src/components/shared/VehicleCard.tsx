import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick?.(vehicle)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Car className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{vehicle.brand} {vehicle.model}</h3>
          <p className="text-sm font-medium uppercase tracking-wider mt-0.5">{vehicle.plate}</p>
          {(vehicle.color || vehicle.year) && (
            <p className="text-xs text-muted-foreground mt-1">
              {[vehicle.color, vehicle.year].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
