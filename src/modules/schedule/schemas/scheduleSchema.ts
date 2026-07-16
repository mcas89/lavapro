import * as z from "zod";

export const scheduleSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente."),
  vehicleId: z.string().min(1, "Selecione um veículo."),
  serviceId: z.string().min(1, "Selecione um serviço."),
  date: z.string().min(1, "Informe a data do agendamento."),
  hour: z.string().min(1, "Informe o horário."),
  notes: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
