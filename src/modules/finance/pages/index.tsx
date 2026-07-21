import { useState } from "react";
import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, Filter, TrendingUp, Printer } from "lucide-react";
import { useCollection } from "@/hooks/useCollection";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";

export default function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: transactions, loading } = useCollection<any>("transactions");
  const { data: settings } = useCollection<any>("settings");
  const { toast } = useToast();

  const profileDoc = settings.find((s: any) => s.id === "profile");
  const companyName = profileDoc?.company?.name || "LavaPro";

  const [filterPeriod, setFilterPeriod] = useState("all");

  const openNewTransaction = () => {
    searchParams.set("newTransaction", "true");
    setSearchParams(searchParams);
  };

  // Filtrar transações pela data selecionada
  const filteredTransactions = transactions.filter((tx: any) => {
    if (filterPeriod === "all") return true;
    
    if (!tx.date) return false;
    
    // Parse manual para evitar bug de UTC e fuso horário
    const [y, m, d] = tx.date.split("-").map(Number);
    const txDate = new Date(y, m - 1, d);
    txDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterPeriod === "today") {
      return txDate.getTime() === today.getTime();
    }
    
    if (filterPeriod === "7days") {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return txDate.getTime() >= sevenDaysAgo.getTime() && txDate.getTime() <= today.getTime();
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

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let startY = 20;
      
      // Verifica se existe logo base64 válida (não blob local)
      if (profileDoc?.logo && profileDoc.logo.startsWith('data:image/')) {
        try {
          doc.addImage(profileDoc.logo, 'PNG', 14, 10, 30, 30);
          startY = 45;
        } catch (e) {
          console.warn("Não foi possível carregar a logo no PDF", e);
        }
      }
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setTextColor(40);
      const textX = (profileDoc?.logo && profileDoc.logo.startsWith('data:image/')) ? 50 : 14;
      const textY = (profileDoc?.logo && profileDoc.logo.startsWith('data:image/')) ? 22 : 20;
      
      doc.text(`Relatório Financeiro`, textX, textY);
      doc.setFontSize(14);
      doc.setTextColor(60);
      doc.text(companyName, textX, textY + 8);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      const periodMap: any = { "today": "Hoje", "7days": "Últimos 7 dias", "month": "Este Mês", "all": "Todo o período" };
      doc.text(`Período analisado: ${periodMap[filterPeriod]}`, textX, textY + 16);
      
      if (!profileDoc?.logo || !profileDoc.logo.startsWith('data:image/')) {
         startY = 45;
      }
      
      // Resumo Financeiro
      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text("Resumo do Período", 14, startY);
      
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94); // Verde
      doc.text(`(+) Entradas: R$ ${incomes.toFixed(2).replace('.', ',')}`, 14, startY + 8);
      
      doc.setTextColor(239, 68, 68); // Vermelho
      doc.text(`(-) Saídas: R$ ${expenses.toFixed(2).replace('.', ',')}`, 14, startY + 14);
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(balance >= 0 ? 21 : 220, balance >= 0 ? 128 : 38, balance >= 0 ? 61 : 38); 
      doc.text(`(=) Saldo: R$ ${balance.toFixed(2).replace('.', ',')}`, 14, startY + 22);
      
      startY += 35;
      
      // Tabela de Transações
      const tableData = sortedTransactions.map((tx: any) => [
        tx.date.split('-').reverse().join('/'),
        tx.description || "-",
        tx.category || "-",
        tx.type === "income" ? "Entrada" : "Saída",
        `R$ ${tx.value.toFixed(2).replace('.', ',')}`
      ]);

      autoTable(doc, {
        startY,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Azul primário do LavaPro
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 3) {
             data.cell.styles.textColor = data.cell.raw === 'Entrada' ? [22, 163, 74] : [220, 38, 38];
             data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      doc.save(`LavaPro_Financeiro_${companyName.replace(/\\s+/g, '_')}_${new Date().getTime()}.pdf`);
      
      toast({
        title: "Sucesso!",
        description: "O relatório PDF foi baixado."
      });
    } catch (err) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível criar o relatório.",
        variant: "destructive"
      });
      console.error(err);
    }
  };

  return (
    <div className="pb-24">
      <TopBar 
        title="Financeiro" 
        showBack={true}
        backTo="/app/dashboard"
        action={
          <div className="flex items-center gap-2">
            <button 
              onClick={generatePDF}
              title="Baixar Relatório PDF"
              className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20 transition flex items-center justify-center"
            >
              <Printer className="h-4 w-4" />
            </button>
            <div className="relative">
              <select 
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="appearance-none bg-primary/10 text-primary font-semibold text-xs py-2 pl-3 pr-8 rounded-full border-none outline-none cursor-pointer"
              >
                <option value="today">Hoje</option>
                <option value="7days">7 Dias</option>
                <option value="month">Este Mês</option>
                <option value="all">Tudo</option>
              </select>
              <Filter className="h-3 w-3 text-primary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
                Saldo do Período
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
