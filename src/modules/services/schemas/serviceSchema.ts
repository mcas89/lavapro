import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(3, { message: "O nome do serviço deve ter pelo menos 3 caracteres." }),
  price: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
  estimatedTime: z.coerce.number().min(10, { message: "O tempo mínimo estimado é 10 minutos." }),
  description: z.string().optional(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
