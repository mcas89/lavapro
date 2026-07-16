import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";
import type { Finance } from "@/types/finance";
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
