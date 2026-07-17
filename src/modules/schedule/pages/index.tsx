import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollection } from "@/hooks/useCollection";

// Helper para gerar os próximos 7 dias úteis
function generateBusinessDays(businessHoursConfig: any) {
  if (!businessHoursConfig || !businessHoursConfig.days) return [];
  
  const days = [];
  let currentDate = new Date();
  
  // Vamos gerar os próximos 14 dias corridos e filtrar os fechados, pegando os 7 primeiros abertos
  for (let i = 0; i < 14; i++) {
    const dayOfWeek = currentDate.getDay(); // 0 (Dom) a 6 (Sáb)
    const businessDayInfo = businessHoursConfig.days.find((d: any) => d.dayOfWeek === dayOfWeek);
    
    if (businessDayInfo && businessDayInfo.isOpen) {
      days.push({
        dateObj: new Date(currentDate), // clone
        dateStr: currentDate.toISOString().split("T")[0],
        label: businessDayInfo.name,
        dateNum: currentDate.getDate().toString(),
        openTime: businessDayInfo.openTime,
        closeTime: businessDayInfo.closeTime,
      });
    }

    if (days.length === 7) break; // Temos 7 dias úteis

    // Avança 1 dia
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

// Helper para gerar os slots de tempo de um dia específico
function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes: number) {
  const slots = [];
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);
  
  let currentMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
    const m = (currentMinutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

// Helper para calendário mensal
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { data: businessHoursData } = useCollection<any>("businessHours");
  const businessHours = businessHoursData[0]; // É singleton
  
  const { data: schedules } = useCollection<any>("schedules");
  const { data: customers } = useCollection<any>("customers");
  const { data: vehicles } = useCollection<any>("vehicles");
  const { data: services } = useCollection<any>("services");
  
  const businessDays = useMemo(() => generateBusinessDays(businessHours), [businessHours]);
  const [selectedDate, setSelectedDate] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const slotsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (businessDays.length > 0 && !selectedDate) {
      setSelectedDate(businessDays[0].dateStr);
    }
  }, [businessDays, selectedDate]);

  // Auto-scroll para a hora atual quando visualizar o dia de hoje
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today && slotsContainerRef.current) {
      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin > 30 ? "30" : "00"}`;
      
      // Um pequeno atraso para garantir que os slots renderizaram
      setTimeout(() => {
        const slotElement = document.getElementById(`slot-${timeStr}`);
        if (slotElement) {
          slotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [selectedDate]);

  const openNewSchedule = (time?: string) => {
    searchParams.set("newSchedule", "true");
    if (time) searchParams.set("time", time);
    if (selectedDate) searchParams.set("date", selectedDate);
    setSearchParams(searchParams);
  };

  const openEditSchedule = (scheduleId: string) => {
    searchParams.set("editSchedule", scheduleId);
    setSearchParams(searchParams);
  };

  const selectedDayConfig = businessDays.find(d => d.dateStr === selectedDate);
  
  const timeSlots = useMemo(() => {
    if (!selectedDayConfig || !businessHours) return [];
    return generateTimeSlots(selectedDayConfig.openTime, selectedDayConfig.closeTime, businessHours.intervalMinutes);
  }, [selectedDayConfig, businessHours]);

  const daySchedules = schedules.filter((s: any) => s.date === selectedDate);

  const daySchedulesWithDuration = useMemo(() => {
    return daySchedules.map((s: any) => {
      const service = services.find((srv: any) => srv.id === s.serviceId);
      const duration = service?.estimatedTime || 30;
      
      const [h, m] = s.hour.split(":").map(Number);
      const startMin = h * 60 + m;
      const endMin = startMin + duration;
      
      return { ...s, startMin, endMin };
    });
  }, [daySchedules, services]);

  // Lógica do Calendário Mensal
  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  return (
    <div className="pb-24">
      <TopBar 
        title="Agenda" 
        showBack 
        backTo="/app/dashboard"
        action={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Filter className="h-5 w-5" />
          </Button>
        }
      />

      {/* Calendário Horizontal Dinâmico */}
      <div className="bg-background border-b sticky top-14 z-20 px-4 py-3">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 rounded-full mr-2"
            onClick={() => setIsCalendarOpen(true)}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          {businessDays.map((day) => {
            const isActive = day.dateStr === selectedDate;
            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[3.5rem] py-2 rounded-xl border transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-transparent border-transparent hover:bg-muted"
                )}
              >
                <span className="text-xs font-medium opacity-80">{day.label}</span>
                <span className="text-lg font-bold">{day.dateNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline de Horários Dinâmica */}
      <div className="p-4 space-y-4" ref={slotsContainerRef}>
        {!selectedDayConfig ? (
          <p className="text-center text-muted-foreground mt-8">Nenhum dia selecionado.</p>
        ) : (
          timeSlots.map(time => {
            const [h, m] = time.split(":").map(Number);
            const slotMin = h * 60 + m;

            const scheduleStartingHere = daySchedulesWithDuration.find((s: any) => s.startMin === slotMin);
            const scheduleCoveringHere = daySchedulesWithDuration.find((s: any) => s.startMin < slotMin && s.endMin > slotMin);

            return (
              <div key={time} id={`slot-${time}`} className="flex gap-4">
                <div className="w-12 pt-2 text-right">
                  <span className="text-xs font-medium text-muted-foreground">{time}</span>
                </div>
                <div className="flex-1">
                  {scheduleStartingHere ? (
                    (() => {
                      const scheduleInSlot = scheduleStartingHere;
                      const customer = customers.find((c: any) => c.id === scheduleInSlot.customerId);
                      const vehicle = vehicles.find((v: any) => v.id === scheduleInSlot.vehicleId);
                      const service = services.find((srv: any) => srv.id === scheduleInSlot.serviceId);
                      return (
                        <div onClick={() => openEditSchedule(scheduleInSlot.id)} className="cursor-pointer">
                          <AppointmentCard 
                            schedule={scheduleInSlot}
                            customerName={customer?.name || "Cliente Não Encontrado"}
                            vehicleInfo={vehicle ? `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}` : "Veículo Desconhecido"}
                            serviceName={service?.name || "Lavagem"} 
                          />
                        </div>
                      );
                    })()
                  ) : scheduleCoveringHere ? (
                    <div className="w-full h-16 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center text-primary/40">
                      <span className="text-sm font-medium">Em Andamento</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => openNewSchedule(time)}
                      className="w-full h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 ring-primary ring-offset-2"
                    >
                      <span className="text-sm font-medium">Slot Livre</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <FloatingActionButton 
        icon={<Plus className="h-6 w-6" />} 
        onClick={() => openNewSchedule()} 
      />

      {/* Calendário Mensal Modal */}
      <BottomSheet isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} title="Calendário Mensal">
        <div className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5" /></Button>
            <h3 className="font-bold text-lg">{monthNames[calendarMonth]} {calendarYear}</h3>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
              <div key={i} className="text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => <div key={`blank-${b}`} className="h-14"></div>)}
            {monthDays.map(day => {
              const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const dayCount = schedules.filter((s: any) => s.date === dateStr).length;
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              const isSelected = dateStr === selectedDate;
              
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setIsCalendarOpen(false);
                  }}
                  className={cn(
                    "h-14 rounded-xl flex flex-col items-center justify-center border transition-colors relative",
                    isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted",
                    isToday && !isSelected && "border-primary/50"
                  )}
                >
                  <span className={cn("text-sm font-semibold", isToday && "text-primary")}>{day}</span>
                  {dayCount > 0 && (
                    <span className="text-[10px] font-medium bg-emerald-100 text-emerald-700 px-1.5 rounded-full mt-0.5">
                      {dayCount} 🚗
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
