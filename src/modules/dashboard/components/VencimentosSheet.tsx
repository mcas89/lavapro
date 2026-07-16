import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollection } from "@/hooks/useCollection";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router";
import { 
  CheckCircle2, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CalendarClock,
  Receipt
} from "lucide-react";

interface VencimentosSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = "todos" | "vencidos" | "avencer";

function getDaysDiff(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T12:00:00");
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export function VencimentosSheet({ isOpen, onClose }: VencimentosSheetProps) {
  const { toast } = useToast();
  const [, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterType>("todos");
  const { data: transactions } = useCollection<any>("transactions");

  // Apenas despesas não pagas com data definida
  const expenses = transactions.filter((t: any) => 
    t.type === "expense" && t.date && !t.isPaid
  );

  const filtered = expenses.filter((t: any) => {
    const days = getDaysDiff(t.date);
    if (filter === "vencidos") return days < 0;
    if (filter === "avencer") return days >= 0;
    return true;
  }).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const vencidosCount = expenses.filter((t: any) => getDaysDiff(t.date) < 0).length;
  const avencerCount = expenses.filter((t: any) => {
    const d = getDaysDiff(t.date);
    return d >= 0 && d <= 7;
  }).length;

  const handleMarkPaid = async (id: string) => {
    try {
      await db.updateDoc("transactions", id, { isPaid: true });
      toast({ title: "Marcado como pago! ✅", description: "Despesa quitada com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta despesa?")) return;
    try {
      await db.deleteDoc("transactions", id);
      toast({ title: "Excluído", description: "Despesa removida." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir.", variant: "destructive" });
    }
  };

  const handleEdit = (id: string) => {
    onClose();
    setTimeout(() => {
      setSearchParams(p => { p.set("editTransaction", id); return p; });
    }, 300);
  };

  const getDayLabel = (days: number) => {
    if (days < 0) return { text: `${Math.abs(days)}d em atraso`, color: "bg-red-100 text-red-700 border-red-200" };
    if (days === 0) return { text: "Vence hoje!", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (days === 1) return { text: "Vence amanhã", color: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    if (days <= 7) return { text: `Em ${days} dias`, color: "bg-blue-100 text-blue-700 border-blue-200" };
    return { text: `Em ${days} dias`, color: "bg-muted text-muted-foreground border-border" };
  };

  const getBorderColor = (days: number) => {
    if (days < 0) return "border-l-red-500";
    if (days === 0) return "border-l-orange-500";
    if (days <= 7) return "border-l-yellow-500";
    return "border-l-muted-foreground/30";
  };

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: "todos", label: "Todos", count: expenses.length },
    { id: "vencidos", label: "Vencidos", count: vencidosCount },
    { id: "avencer", label: "A vencer", count: avencerCount },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0 pb-0 flex flex-col">
        <SheetHeader className="px-4 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-left text-xl font-bold">
            <CalendarClock className="h-5 w-5 text-orange-500" />
            Vencimentos
          </SheetTitle>

          {/* Resumo rápido */}
          {(vencidosCount > 0 || avencerCount > 0) && (
            <div className="flex gap-2 mt-1">
              {vencidosCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1 text-xs font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  {vencidosCount} vencido{vencidosCount > 1 ? "s" : ""}
                </div>
              )}
              {avencerCount > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-3 py-1 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  {avencerCount} nos próx. 7 dias
                </div>
              )}
            </div>
          )}
        </SheetHeader>

        {/* Filtros */}
        <div className="flex gap-2 px-4 py-3 border-b overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`flex items-center justify-center h-4 w-4 rounded-full text-[10px] ${
                  filter === f.id ? "bg-white/20" : "bg-muted text-foreground"
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-500/50" />
              <p className="font-semibold">Tudo em dia!</p>
              <p className="text-sm mt-1">Nenhuma despesa pendente neste filtro.</p>
            </div>
          ) : (
            filtered.map((t: any) => {
              const days = getDaysDiff(t.date);
              const { text: dayLabel, color: dayColor } = getDayLabel(days);
              const borderColor = getBorderColor(days);

              return (
                <div
                  key={t.id}
                  className={`bg-card border border-border border-l-4 ${borderColor} rounded-xl p-4 space-y-3`}
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm leading-tight truncate">
                          {t.description}
                        </p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${dayColor}`}>
                          {dayLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          <Receipt className="h-3 w-3 inline mr-1" />
                          {t.category || "Despesa"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Vence: {formatDate(t.date)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-base text-red-600 shrink-0">
                      R$ {Number(t.value).toFixed(2)}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button
                      size="sm"
                      onClick={() => handleMarkPaid(t.id)}
                      className="h-8 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white flex-1 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Marcar como Pago
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleEdit(t.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
