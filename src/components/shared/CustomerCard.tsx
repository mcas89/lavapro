import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar } from "lucide-react";
import type { Customer } from "@/types/customer";

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    frequent: "bg-green-100 text-green-800",
    vip: "bg-purple-100 text-purple-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    new: "Novo",
    frequent: "Frequente",
    vip: "VIP",
    inactive: "Inativo",
  };

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick?.(customer)}>
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold truncate pr-2">{customer.name}</h3>
            <Badge variant="secondary" className={statusColors[customer.status]}>
              {statusLabels[customer.status]}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {customer.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.lastVisit && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Última visita: {new Date(customer.lastVisit).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
