import { z } from 'zod';

export const eventsSchema = z.object({
  name: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  slug: z.string().min(1, 'URL é obrigatória'),
  logo: z
    .custom<File | null>(file => {
      if (!file) return true;
      if (!(file instanceof File)) return false;
      return file.type === 'image/jpeg' || file.type === 'image/png';
    }, 'A logo deve ser uma imagem JPG ou PNG')
    .refine(
      file => {
        if (!file) return true;
        return file.size <= 1024 * 1024 * 3;
      },
      { message: 'A logo deve ter no máximo 3 mb' }
    )
    .optional(),
  addressZipCode: z.string().min(1, 'CEP é obrigatório'),
  addressStreet: z.string().min(1, 'Rua é obrigatória'),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().min(1, 'Bairro é obrigatório'),
  addressCity: z.string().min(1, 'Cidade é obrigatória'),
  addressState: z.string().min(1, 'Estado é obrigatório'),
  addressCountry: z.string().min(1, 'País é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  confirmationType: z.enum(['email', 'sms'], {
    required_error: 'Tipo de confirmação é obrigatório',
  }),
  hasGift: z.boolean(),
  giftDescription: z.string().optional(),
  hasPrize: z.boolean(),
  prizeDescription: z.string().optional(),
});
