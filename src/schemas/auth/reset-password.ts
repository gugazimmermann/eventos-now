import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Email inválido"),
    code: z.string().min(1, "Código é obrigatório"),
    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/,
        "A senha deve ter 1 maiúscula, 1 minúscula, 1 número e 1 símbolo."
      ),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "As senhas não coincidem",
    path: ["repeatPassword"],
  });
