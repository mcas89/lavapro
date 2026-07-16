import * as z from "zod";

export const vehicleSchema = z.object({
  plate: z.string().min(7, { message: "Placa inválida. Digite no formato ABC-1234." }),
  brand: z.string().min(1, { message: "A marca é obrigatória." }),
  model: z.string().min(1, { message: "O modelo é obrigatório." }),
  color: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  phone: z.string().min(10, { message: "WhatsApp/Telefone inválido." }),
  address: z.string().optional(),
  // We don't embed vehicles directly in the customer form array for this UX flow,
  // vehicles are created and attached separately, but we could use an array of IDs.
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
