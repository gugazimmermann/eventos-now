import { z } from "zod";

export const registerSchema = z.object({
  companyDocument: z.string().min(14, "CNPJ inválido"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  companyOwner: z.string().min(1, "Responsável é obrigatório"),
  email: z.string().email("Email inválido"),
  companyPhone: z.string().min(8, "Telefone é obrigatório"),
  addressZipCode: z.string().min(8, "CEP inválido"),
  addressStreet: z.string().min(1, "Rua é obrigatória"),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().min(1, "Bairro é obrigatório"),
  addressCity: z.string().min(1, "Cidade é obrigatória"),
  addressState: z.string().min(1, "Estado é obrigatório"),
  addressCountry: z.string().min(1, "País é obrigatório"),
  password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, "A senha deve ter 1 maiúscula, 1 minúscula, 1 número e 1 símbolo."),
  repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  message: "As senhas não coincidem",
  path: ["repeatPassword"],
});
