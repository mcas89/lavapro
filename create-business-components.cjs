const fs = require('fs');
const path = require('path');

const sharedDir = path.join(__dirname, 'src', 'components', 'shared');

// --- CustomerCard ---
const customerCardContent = `import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar } from "lucide-react";
import { Customer } from "@/types/customer";

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
`;

// --- VehicleCard ---
const vehicleCardContent = `import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Vehicle } from "@/types/vehicle";

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
`;

// --- AppointmentCard ---
const appointmentCardContent = `import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Car } from "lucide-react";
import { Schedule } from "@/types/schedule";

interface AppointmentCardProps {
  schedule: Schedule;
  customerName?: string;
  vehicleInfo?: string;
  serviceName?: string;
  onClick?: (schedule: Schedule) => void;
}

export function AppointmentCard({ schedule, customerName, vehicleInfo, serviceName, onClick }: AppointmentCardProps) {
  const statusConfig = {
    scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
    in_progress: { label: "Em Andamento", className: "bg-amber-100 text-amber-800" },
    completed: { label: "Finalizado", className: "bg-green-100 text-green-800" },
    canceled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[schedule.status];

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
`;

// --- EmployeeCard ---
const employeeCardContent = `import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/employee";

interface EmployeeCardProps {
  employee: Employee;
  onClick?: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick?.(employee)}>
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{employee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{employee.name}</h3>
          <p className="text-xs text-muted-foreground">{employee.role}</p>
        </div>
        <div>
          <Badge variant={employee.active ? "default" : "secondary"}>
            {employee.active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
`;

// --- FinanceCard ---
const financeCardContent = `import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";
import { Finance } from "@/types/finance";
import { cn } from "@/lib/utils";

interface FinanceCardProps {
  finance: Finance;
  onClick?: (finance: Finance) => void;
}

export function FinanceCard({ finance, onClick }: FinanceCardProps) {
  const isIncome = finance.type === "income";
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  
  const paymentIcons = {
    cash: Banknote,
    credit: CreditCard,
    debit: CreditCard,
    pix: Smartphone,
    bank_transfer: Landmark,
  };
  
  const PaymentIcon = paymentIcons[finance.paymentMethod] || Banknote;

  return (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick?.(finance)}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{finance.description}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <PaymentIcon className="h-3 w-3" />
              <span className="capitalize">{finance.paymentMethod.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className={cn("font-bold text-lg", isIncome ? "text-success" : "text-destructive")}>
          {isIncome ? "+" : "-"} R$ {finance.value.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
}
`;

// --- Timeline ---
const timelineContent = `import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: ReactNode;
  isActive?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                item.isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background text-muted-foreground"
              )}
            >
              {item.icon || <div className="h-2 w-2 rounded-full bg-current" />}
            </div>
            {index < items.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
          </div>
          <div className="flex-1 pb-4">
            <h4 className={cn("font-semibold", item.isActive ? "text-foreground" : "text-muted-foreground")}>
              {item.title}
            </h4>
            {item.date && <p className="text-xs text-muted-foreground mt-0.5">{item.date}</p>}
            {item.description && <p className="text-sm mt-1 text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
`;

fs.writeFileSync(path.join(sharedDir, 'CustomerCard.tsx'), customerCardContent);
fs.writeFileSync(path.join(sharedDir, 'VehicleCard.tsx'), vehicleCardContent);
fs.writeFileSync(path.join(sharedDir, 'AppointmentCard.tsx'), appointmentCardContent);
fs.writeFileSync(path.join(sharedDir, 'EmployeeCard.tsx'), employeeCardContent);
fs.writeFileSync(path.join(sharedDir, 'FinanceCard.tsx'), financeCardContent);
fs.writeFileSync(path.join(sharedDir, 'Timeline.tsx'), timelineContent);

console.log('Business components criados!');
