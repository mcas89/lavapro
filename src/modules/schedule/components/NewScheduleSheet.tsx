import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleSchema, type ScheduleFormValues } from "../schemas/scheduleSchema";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollection } from "@/hooks/useCollection";
import { db } from "@/lib/db";
import { Trash2 } from "lucide-react";

export function NewScheduleSheet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isOpen = searchParams.get("newSchedule") === "true";
  const editId = searchParams.get("editSchedule");
  const isEdit = !!editId;
  const isSheetOpen = isOpen || isEdit;

  const timeParam = searchParams.get("time");
  const dateParam = searchParams.get("date");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: customers } = useCollection<any>("customers");
  const { data: vehicles } = useCollection<any>("vehicles");
  const { data: services } = useCollection<any>("services");

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      serviceId: "",
      date: "",
      hour: "",
      notes: "",
    },
  });

  const customerId = form.watch("customerId");

  useEffect(() => {
    async function loadSchedule() {
      if (editId) {
        setLoading(true);
        const doc = await db.getDoc<any>("schedules", editId);
        if (doc) {
          form.reset({
            customerId: doc.customerId || "",
            vehicleId: doc.vehicleId || "",
            serviceId: doc.serviceId || "",
            date: doc.date || "",
            hour: doc.hour || "",
            notes: doc.notes || "",
          });
        }
        setLoading(false);
      }
    }

    if (isSheetOpen) {
      if (editId) {
        loadSchedule();
      } else {
        const now = new Date();
        const currentDate = now.toISOString().split("T")[0];
        const currentHour = now.toTimeString().slice(0, 5); // "HH:MM"

        form.reset({
          customerId: "",
          vehicleId: "",
          serviceId: "",
          date: dateParam || currentDate,
          hour: timeParam || currentHour,
          notes: "",
        });
      }
    }
  }, [isSheetOpen, timeParam, dateParam, editId, form]);

  const handleClose = () => {
    searchParams.delete("newSchedule");
    searchParams.delete("editSchedule");
    searchParams.delete("time");
    searchParams.delete("date");
    setSearchParams(searchParams, { replace: true });
  };

  const onSubmit = async (data: ScheduleFormValues) => {
    setLoading(true);
    try {
      if (isEdit && editId) {
        await db.updateDoc("schedules", editId, data);
        toast({ title: "Agendamento atualizado!" });
      } else {
        await db.addDoc("schedules", {
          ...data,
          status: "scheduled",
          createdAt: new Date().toISOString()
        });
        toast({ title: "Agendamento criado!", description: "O serviço foi agendado com sucesso." });
      }
      handleClose();
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (confirm("Tem certeza que deseja cancelar e excluir este agendamento?")) {
      setLoading(true);
      try {
        await db.deleteDoc("schedules", editId);
        toast({ title: "Excluído", description: "Agendamento cancelado com sucesso." });
        handleClose();
      } catch (e) {
        toast({ title: "Erro", description: "Falha ao excluir.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredVehicles = vehicles.filter((v: any) => v.customerId === customerId);

  return (
    <BottomSheet isOpen={isSheetOpen} onClose={handleClose} title={isEdit ? "Editar Agendamento" : "Novo Agendamento"}>
      {isEdit && (
        <div className="absolute top-4 right-12 z-50">
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-6">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.length === 0 ? (
                      <SelectItem value="none" disabled>Nenhum cliente cadastrado</SelectItem>
                    ) : (
                      customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!customerId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={customerId ? "Selecione o veículo" : "Selecione o cliente primeiro"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredVehicles.length === 0 && customerId ? (
                      <SelectItem value="none" disabled>Nenhum veículo encontrado</SelectItem>
                    ) : (
                      filteredVehicles.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} • {v.plate}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Qual serviço?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.length === 0 ? (
                      <SelectItem value="none" disabled>Nenhum serviço configurado</SelectItem>
                    ) : (
                      services.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} (R$ {s.price})</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Processando..." : (isEdit ? "Atualizar Agendamento" : "Confirmar Agendamento")}
          </Button>
        </form>
      </Form>
    </BottomSheet>
  );
}
