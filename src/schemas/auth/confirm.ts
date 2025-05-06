import { z } from "zod";

export const confirmSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().min(1, "Código de confirmação é obrigatório"),
});
