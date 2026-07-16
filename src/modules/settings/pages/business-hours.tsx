import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockBusinessHours } from "@/modules/dashboard/utils/mockData";
import { useNavigate } from "react-router";
import { Save } from "lucide-react";

import { Input } from "@/components/ui/input";

// DayRow Component to prevent re-rendering all days when one changes
const DayRow = memo(({ 
  day, 
  idx, 
  toggleDay, 
  updateTime 
}: { 
  day: any, 
  idx: number, 
  toggleDay: (idx: number) => void, 
  updateTime: (idx: number, field: 'openTime' | 'closeTime', value: string) => void 
}) => {
  return (
    <div className="flex flex-col p-4 border-b last:border-0">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold">{day.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {day.isOpen ? "Aberto" : "Fechado"}
          </span>
          <Switch 
            checked={day.isOpen} 
            onCheckedChange={() => toggleDay(idx)} 
          />
        </div>
      </div>

      {day.isOpen && (
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Abertura</span>
            <Input 
              type="time" 
              className="h-10" 
              value={day.openTime || "08:00"} 
              onChange={(e) => updateTime(idx, 'openTime', e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-xs text-muted-foreground">Fechamento</span>
            <Input 
              type="time" 
              className="h-10" 
              value={day.closeTime || "18:00"} 
              onChange={(e) => updateTime(idx, 'closeTime', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
});

DayRow.displayName = "DayRow";

import { useCollection } from "@/hooks/useCollection";
import { db } from "@/lib/db";

// ... [inside BusinessHoursPage] ...
export default function BusinessHoursPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: businessHoursData } = useCollection<any>("businessHours");
  
  // Garantir que os dados existem e tem a propriedade days
  const dbHours = businessHoursData.length > 0 && Array.isArray(businessHoursData[0].days) 
    ? businessHoursData[0] 
    : mockBusinessHours;

  const [hours, setHours] = useState(dbHours);

  // Sync state se os dados chegarem depois do primeiro render
  useEffect(() => {
    if (businessHoursData.length > 0 && Array.isArray(businessHoursData[0].days)) {
      setHours(businessHoursData[0]);
    }
  }, [businessHoursData]);

  const toggleDay = useCallback((dayIndex: number) => {
    setHours((prev: any) => {
      const newDays = [...prev.days];
      newDays[dayIndex] = { ...newDays[dayIndex], isOpen: !newDays[dayIndex].isOpen };
      return { ...prev, days: newDays };
    });
  }, []);

  const updateTime = useCallback((dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev: any) => {
      const newDays = [...prev.days];
      newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
      return { ...prev, days: newDays };
    });
  }, []);

  const handleSave = () => {
    db.updateDoc("businessHours", hours.id, hours);
    toast({
      title: "Configurações salvas!",
      description: "Os horários da agenda foram atualizados.",
    });
    navigate(-1);
  };

  return (
    <div className="pb-24">
      <TopBar title="Horários de Funcionamento" showBack backTo="/app/configuracoes" />

      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Regra de Agendamento
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Intervalo da Agenda</span>
              <Select 
                value={hours.intervalMinutes.toString()} 
                onValueChange={(val) => setHours(prev => ({...prev, intervalMinutes: parseInt(val)}))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Define de quanto em quanto tempo um novo horário aparece disponível para agendar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 flex flex-col">
            {hours.days.map((day: any, idx: number) => (
              <DayRow 
                key={day.dayOfWeek}
                day={day}
                idx={idx}
                toggleDay={toggleDay}
                updateTime={updateTime}
              />
            ))}
          </CardContent>
        </Card>

        <Button className="w-full h-12 text-lg font-bold gap-2" onClick={handleSave}>
          <Save className="h-5 w-5" /> Salvar Horários
        </Button>
      </div>
    </div>
  );
}
