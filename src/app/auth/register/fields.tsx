import { Field } from '@/app/auth/components/AuthForm';
import { brazilianStates } from '@/app/utils/states';

export const fields: Field[] = [
  {
    label: 'CNPJ',
    name: 'companyDocument',
    type: 'text',
    required: true,
    width: 'full',
  },
  {
    label: 'Nome da Empresa',
    name: 'companyName',
    type: 'text',
    required: true,
  },
  {
    label: 'Responsável',
    name: 'companyOwner',
    type: 'text',
    required: true,
  },
  { label: 'Email', name: 'email', type: 'email', required: true },
  {
    label: 'Telefone',
    name: 'companyPhone',
    type: 'text',
    required: true,
  },
  {
    label: 'CEP',
    name: 'addressZipCode',
    type: 'text',
    required: true,
  },
  { label: 'Rua', name: 'addressStreet', type: 'text', required: true },
  {
    label: 'Número',
    name: 'addressNumber',
    type: 'text',
    required: false,
  },
  {
    label: 'Complemento',
    name: 'addressComplement',
    type: 'text',
    required: false,
  },
  {
    label: 'Bairro',
    name: 'addressNeighborhood',
    type: 'text',
    required: true,
  },
  {
    label: 'Cidade',
    name: 'addressCity',
    type: 'text',
    required: true,
  },
  {
    label: 'Estado',
    name: 'addressState',
    type: 'select',
    required: true,
    options: brazilianStates,
  },
  {
    label: 'País',
    name: 'addressCountry',
    type: 'select',
    required: true,
    disabled: true,
    options: [{ value: 'BR', label: 'Brasil' }],
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
