import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bell, CarFront, TrendingUp, TrendingDown, UserPlus, QrCode, CreditCard, Banknote, Play, Store, Lightbulb, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router";
import { useCollection } from "@/hooks/useCollection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { db } from "@/lib/db";
import { VencimentosSheet } from "../components/VencimentosSheet";

// Função para formatar a data como Hoje, Amanhã ou Data curta
function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const targetDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  if (diffDays === 2) return "Daqui a 2 dias";
  return `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`;
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: schedules } = useCollection<any>("schedules");
  const { data: transactions } = useCollection<any>("transactions");
  const { data: customers } = useCollection<any>("customers");
  const { data: vehicles } = useCollection<any>("vehicles");
  const { data: workOrders } = useCollection<any>("workOrders");
  const { data: settingsList, loading: settingsLoading } = useCollection<any>("settings");

  // Nome do dono/gestor (dinâmico) e logo
  const [ownerName, setOwnerName] = useState("Gestor");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!settingsLoading && settingsList) {
      const profileDoc = settingsList.find((doc: any) => doc.id === "profile");
      if (profileDoc) {
        if (profileDoc.company?.ownerName) setOwnerName(profileDoc.company.ownerName);
        else if (profileDoc.company?.name) setOwnerName(profileDoc.company.name);
        
        if (profileDoc.logo) setLogo(profileDoc.logo);
      }
    }
  }, [settingsList, settingsLoading]);
  const [isVencimentosOpen, setIsVencimentosOpen] = useState(false);
  // ── Notificações (Sininho) ──
  const [notifications, setNotifications] = useState<any[]>([]);

  // Dismiss individual notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const newNotifications: any[] = [];
    const now = new Date();
    
    // 1. Contas chegando (próximos 2 dias) — apenas não pagas
    const upcomingExpenses = transactions.filter((t: any) => {
      if (t.type !== 'expense') return false;
      if (t.isPaid === true) return false;
      if (!t.date) return false;
      // Usa T12:00:00 para evitar problemas de fuso horário
      const tDate = new Date(t.date + "T12:00:00");
      const todayMidnight = new Date(now);
      todayMidnight.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((tDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2;
    });

    if (upcomingExpenses.length > 0) {
      newNotifications.push({
        id: 'n1',
        title: 'Contas a Pagar',
        message: `Você tem ${upcomingExpenses.length} despesa(s) vencendo hoje ou nos próximos 2 dias.`,
      });
    }

    // 2. Próximo agendamento (dentro de 2 horas)
    // Só considera agendamentos com status "scheduled" — ignora cancelados, em andamento, concluídos
    const todayStr = now.toISOString().split("T")[0];
    const todayAppointments = schedules
      .filter((s: any) => {
        if (s.date !== todayStr) return false;
        if (!s.hour) return false;
        // Apenas agendamentos pendentes
        if (s.status !== 'scheduled') return false;
        return true;
      })
      .map((s: any) => {
        const [hours, minutes] = s.hour.split(":");
        const sTime = new Date(now);
        sTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        const vehicle = vehicles.find((v: any) => v.id === s.vehicleId);
        return { ...s, sTime, vehiclePlate: vehicle?.plate || 'Desconhecida' };
      })
      .filter((s: any) => s.sTime > now) // Apenas horários que ainda não chegaram
      .sort((a: any, b: any) => a.sTime.getTime() - b.sTime.getTime());

    if (todayAppointments.length > 0) {
      const nextApp = todayAppointments[0];
      const diffMins = Math.floor((nextApp.sTime.getTime() - now.getTime()) / 60000);
      
      // Só notifica se estiver dentro de 2 horas (120 min)
      if (diffMins <= 120) {
        newNotifications.push({
          id: 'n2',
          title: 'Próximo Agendamento',
          message: `Placa ${nextApp.vehiclePlate} em ${diffMins} minutos (${nextApp.hour}).`,
        });
      }
    }

    setNotifications(newNotifications);
  }, [transactions, schedules, vehicles]);

  const openNewSchedule = () => {
    searchParams.set("newSchedule", "true");
    setSearchParams(searchParams);
  };

  // ── Inteligência: Demanda ──
  const today = new Date().toISOString().split("T")[0];
  const todaySchedules = schedules.filter((s: any) => s.date === today).length;
  const demandInsight = todaySchedules > 4 
    ? { id: '1', type: 'warning', icon: '🔥', title: 'Alta Demanda Hoje', description: `Você tem ${todaySchedules} agendamentos hoje. Prepare a equipe para o ritmo acelerado.` }
    : { id: '1', type: 'info', icon: '📅', title: 'Agenda Tranquila', description: 'O dia está tranquilo. Ótima oportunidade para fazer promoções ou focar na organização.' };

  // ── Inteligência: Financeiro ──
  const todayIncomes = transactions.filter((t: any) => t.type === 'income' && t.date === today).reduce((acc: number, t: any) => acc + t.value, 0);
  const todayExpenses = transactions.filter((t: any) => t.type === 'expense' && t.date === today).reduce((acc: number, t: any) => acc + t.value, 0);
  
  const financeInsight = todayExpenses > todayIncomes
    ? { id: '2', type: 'error', icon: '🚨', title: 'Atenção no Fluxo de Caixa', description: `Suas saídas (R$ ${todayExpenses.toFixed(2)}) estão maiores que as entradas hoje. Fique de olho!` }
    : { id: '2', type: 'success', icon: '💰', title: 'Caixa Positivo', description: `Parabéns! Você já gerou R$ ${todayIncomes.toFixed(2)} em receita hoje.` };

  // ── Inteligência: Clientes ──
  const totalCustomers = customers.length;
  const customerInsight = totalCustomers > 0
    ? { id: '3', type: 'info', icon: '👥', title: 'Base de Clientes', description: `Sua base tem ${totalCustomers} clientes cadastrados.` }
    : { id: '3', type: 'warning', icon: '👥', title: 'Base de Clientes', description: 'Você ainda não tem clientes cadastrados.' };

  // ── Inteligência: Dicas do App ──
  const educationInsight = { 
    id: '4', 
    type: 'primary', 
    icon: <Lightbulb className="h-6 w-6 text-yellow-500" />, 
    title: 'Dica de Ouro', 
    description: 'Personalize horários e serviços clicando no atalho "Empresa" logo acima.' 
  };

  const dynamicInsights = [demandInsight, financeInsight, customerInsight, educationInsight];

  // Carousel auto-scroll ref
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4500); // 4.5s
    return () => clearInterval(interval);
  }, []);

  // ── Dados Reais do Raio-X ──
  const completedToday = transactions.filter((t: any) => t.type === 'income' && t.date === today).length;
  const pendingVehicles = workOrders.filter((wo: any) => wo.status !== 'ready').length;
  const pixTotal = transactions.filter((t: any) => t.type === 'income' && t.paymentMethod === 'Pix').reduce((acc: number, t: any) => acc + t.value, 0);
  const cardTotal = transactions.filter((t: any) => t.type === 'income' && t.paymentMethod === 'Cartão').reduce((acc: number, t: any) => acc + t.value, 0);
  const cashTotal = transactions.filter((t: any) => t.type === 'income' && t.paymentMethod === 'Dinheiro').reduce((acc: number, t: any) => acc + t.value, 0);

  // Pegar apenas os agendamentos "Scheduled" para a seção Próximos
  const upcomingSchedules = schedules
    .filter((s: any) => s.status === 'scheduled' && s.date >= today)
    .sort((a: any, b: any) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.hour.localeCompare(b.hour);
    })
    .slice(0, 3);

  return (
    <div className="pb-24">
      <TopBar 
        title={
          <div className="flex items-center gap-3">
            <img 
              src={logo || "/lavapro2.png"} 
              alt="Logo" 
              className="h-8 w-auto max-w-[120px] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/lavapro2.png'; }}
            />
            <span>Olá, {ownerName}!</span>
          </div>
        }
        action={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className={notifications.length > 0 ? "h-5 w-5 animate-pulse text-primary" : "h-5 w-5"} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm border border-background">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden">
              <div className="bg-muted/50 p-3 border-b">
                <h3 className="font-semibold text-sm">Suas Notificações</h3>
              </div>
              <div className="p-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma notificação no momento.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => dismissNotification(n.id)}
                        className="p-3 rounded-lg hover:bg-muted/50 transition-colors border-l-2 border-primary cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">Toque para fechar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        }
      />

      <div className="p-4 space-y-8">
        {/* Ações Rápidas */}
        <section>
          <div className="grid grid-cols-5 gap-2">
            <button onClick={() => navigate("/app/configuracoes")} className="flex flex-col items-center justify-center gap-2 group">
              <div className="h-14 w-14 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">Empresa</span>
            </button>
            <button onClick={() => navigate("/app/financeiro?newTransaction=true&type=income")} className="flex flex-col items-center justify-center gap-2 group">
              <div className="h-14 w-14 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">Receita</span>
            </button>
            <button onClick={() => navigate("/app/financeiro?newTransaction=true&type=expense")} className="flex flex-col items-center justify-center gap-2 group">
              <div className="h-14 w-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                <TrendingDown className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">Despesa</span>
            </button>
            <button onClick={() => navigate("/app/clientes")} className="flex flex-col items-center justify-center gap-2 group">
              <div className="h-14 w-14 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <UserPlus className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">Cliente</span>
            </button>
            <button onClick={() => setIsVencimentosOpen(true)} className="flex flex-col items-center justify-center gap-2 group">
              <div className="h-14 w-14 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <CalendarClock className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium text-center leading-tight">Vencimentos</span>
            </button>
          </div>
        </section>

        {/* Insights (Dinâmicos) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Insights</h2>
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory hide-scrollbar touch-pan-x"
          >
            {dynamicInsights.map((insight) => (
              <Card key={insight.id} className="w-[85vw] max-w-[320px] snap-center shrink-0 border-l-4" style={{ 
                borderLeftColor: insight.type === 'success' ? 'hsl(var(--success))' : 
                                insight.type === 'warning' ? 'hsl(var(--warning))' : 
                                insight.type === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' 
              }}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl leading-none mt-0.5">{insight.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm leading-tight">{insight.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Raio-X Hoje (Agora Dinâmico) */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Raio-X Hoje</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Card className="border-none shadow-sm bg-primary text-primary-foreground">
              <CardContent className="p-4 flex flex-col justify-center">
                <span className="text-xs font-medium opacity-90 mb-1">Receita do Dia</span>
                <span className="text-2xl font-black">R$ {todayIncomes.toFixed(2)}</span>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-4 flex flex-col justify-center">
                <span className="text-xs font-medium text-muted-foreground mb-1">Veículos Atendidos</span>
                <span className="text-2xl font-black text-foreground">{completedToday}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{pendingVehicles} na fila</span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold">R$ {pixTotal.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold">R$ {cardTotal.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold">R$ {cashTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block mb-0.5">Despesas</span>
                <span className="text-sm font-bold text-red-500">-R$ {todayExpenses.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Próximos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CarFront className="h-4 w-4" /> Próximos
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento próximo.</p>
            ) : (
              upcomingSchedules.map((schedule: any) => {
                const vehicle = vehicles.find((v: any) => v.id === schedule.vehicleId);
                const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}` : 'Veículo Desconhecido';
                
                return (
                  <div key={schedule.id} className="space-y-1">
                    {/* Etiqueta de data ACIMA do card */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-bold">
                        {formatDateLabel(schedule.date)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{schedule.hour}</span>
                    </div>
                    <div className="relative">
                      <AppointmentCard 
                        schedule={schedule}
                        customerName={customers.find((c: any) => c.id === schedule.customerId)?.name || 'Cliente'}
                        vehicleInfo={vehicleName}
                        serviceName={schedule.service || 'Lavagem'}
                      />
                      <div className="absolute top-3 right-3">
                        <Button 
                          size="sm" 
                          className="h-8 gap-1" 
                          onClick={async () => {
                            try {
                              await db.updateDoc("schedules", schedule.id, { status: "in-progress" });
                              await db.addDoc("workOrders", {
                                scheduleId: schedule.id,
                                customerId: schedule.customerId,
                                vehicleId: schedule.vehicleId,
                                serviceId: schedule.serviceId,
                                status: "washing", 
                                startTime: new Date().toISOString()
                              });
                              navigate("/app/pista?tab=washing");
                            } catch (e) {
                              console.error("Erro ao iniciar lavagem", e);
                            }
                          }}
                        >
                          <Play className="h-3 w-3" fill="currentColor" />
                          Iniciar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <FloatingActionButton 
        icon={<Plus className="h-6 w-6" />} 
        onClick={openNewSchedule} 
      />
      
      <VencimentosSheet isOpen={isVencimentosOpen} onClose={() => setIsVencimentosOpen(false)} />
    </div>
  );
}
