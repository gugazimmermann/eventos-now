import { Field } from '@/app/auth/components/AuthForm';

export const fields: Field[] = [
  { label: 'Email', name: 'email', type: 'email', required: true, disabled: true },
  {
    label: 'Código de Confirmação',
    name: 'code',
    type: 'text',
  },
];
