import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/types/employee";

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
