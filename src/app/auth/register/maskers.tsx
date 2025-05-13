import { Masker } from '@/app/auth/components/AuthForm';
import { maskCNPJ, maskPhone, maskZipCode } from '@/app/utils/maskers';

export const maskers: Masker = {
  companyDocument: maskCNPJ,
  addressZipCode: maskZipCode,
  companyPhone: maskPhone,
};
