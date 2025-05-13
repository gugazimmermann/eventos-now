import { Masker } from '@/app/auth/components/AuthForm';
import { maskZipCode } from '@/app/utils/maskers';

export const maskers: Masker = {
  addressZipCode: maskZipCode,
};
