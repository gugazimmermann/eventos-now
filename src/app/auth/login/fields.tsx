import { Field } from '@/app/auth/components/AuthForm';

export const fields: Field[] = [
  {
    label: 'Email',
    name: 'email',
    type: 'email',
    required: true,
  },
  {
    label: 'Senha',
    name: 'password',
    type: 'password',
    required: true,
  },
];
