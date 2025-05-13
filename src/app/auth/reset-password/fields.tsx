import { Field } from '@/app/auth/components/AuthForm';

export const fields: Field[] = [
  {
    label: 'Email',
    name: 'email',
    type: 'email',
    required: true,
  },
  {
    label: 'Código',
    name: 'code',
    type: 'text',
  },
  {
    label: 'Senha',
    name: 'password',
    type: 'password',
    required: true,
  },
  {
    label: 'Repetir a Senha',
    name: 'repeatPassword',
    type: 'password',
    required: true,
  },
];
