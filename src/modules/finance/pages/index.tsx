import { useState } from "react";
import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, Filter, TrendingUp } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: transactions, loading } = useCollection<any>("transactions");

  const [filterPeriod, setFilterPeriod] = useState("all");

  const openNewTransaction = () => {
    searchParams.set("newTransaction", "true");
    setSearchParams(searchParams);
  };

  // Filtrar transações pela data selecionada
  const filteredTransactions = transactions.filter((tx: any) => {
    if (filterPeriod === "all") return true;
    
    // Anexa T00:00:00 para forçar o parse no fuso horário local e evitar bug de dia anterior
    const txDate = new Date(tx.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterPeriod === "today") {
      return txDate.getTime() >= today.getTime();
    }
    
    if (filterPeriod === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return txDate.getTime() >= sevenDaysAgo.getTime();
    }
    
    if (filterPeriod === "month") {
      return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
    }
    
    return true;
  });

  // Calcular totais
  const incomes = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.value, 0);
    
  const expenses = filteredTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((acc: any, curr: any) => acc + curr.value, 0);

  const balance = incomes - expenses;

  // Ordenar por data mais recente
  const sortedTransactions = [...filteredTransactions].sort((a: any, b: any) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="pb-24">
      <TopBar 
        title="Financeiro" 
        showBack={true}
        backTo="/app/dashboard"
        action={
          <div className="relative">
            <select 
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="appearance-none bg-primary/10 text-primary font-semibold text-xs py-1.5 pl-3 pr-8 rounded-full border-none outline-none cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="7days">7 Dias</option>
              <option value="month">Este Mês</option>
              <option value="all">Tudo</option>
            </select>
            <Filter className="h-3 w-3 text-primary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        }
      />

      <div className="p-4 space-y-6">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="col-span-2 border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
            <CardContent className="p-5 flex flex-col justify-center items-center">
              <span className="text-sm font-medium opacity-90 mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Saldo do Mês
              </span>
              <span className="text-3xl font-black">
                R$ {balance.toFixed(2)}
              </span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <ArrowUpCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">Entradas</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                R$ {incomes.toFixed(2)}
              </span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <div className="flex items-center gap-1.5 text-red-600 mb-1">
                <ArrowDownCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">Saídas</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                R$ {expenses.toFixed(2)}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Movimentações */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1 mb-2">
            Últimas Movimentações
          </h2>
          
          {loading ? (
             <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
          ) : sortedTransactions.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center">
               <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-2" />
               <p>Nenhuma transação registrada.</p>
             </div>
          ) : (
            sortedTransactions.map((tx: any) => {
              const isIncome = tx.type === "income";
              
              // Format date to local readable string (DD/MM)
              const [, m, d] = tx.date.split("-");
              const dateStr = `${d}/${m}`;
              
              return (
                <Card 
                  key={tx.id} 
                  className="border-none shadow-sm bg-card overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    searchParams.set("editTransaction", tx.id);
                    setSearchParams(searchParams);
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      )}>
                        {isIncome ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                      </div>
                      
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{tx.description}</h3>
                          {!isIncome && tx.isPaid === false && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Em aberto"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                            {tx.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {dateStr}
                          </span>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "font-bold whitespace-nowrap ml-2",
                        isIncome ? "text-emerald-600" : "text-red-600"
                      )}>
                        {isIncome ? "+" : "-"} R$ {tx.value.toFixed(2)}
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
        icon={<Plus className="h-6 w-6" />} 
        onClick={openNewTransaction} 
      />
    </div>
  );
}
