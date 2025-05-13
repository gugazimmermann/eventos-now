import { toast } from 'react-toastify';
import { toTitleCase } from '@/app/utils/converters';
import { maskPhone, maskZipCode } from '@/app/utils/maskers';

export const fetchCNPJData = async (
  cnpj: string,
  initialFormValues: Record<string, string>,
  setFormValues: React.Dispatch<
    React.SetStateAction<Record<string, string | boolean | File | null>>
  >
) => {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!res.ok) toast.warning('CNPJ não encontrado');
    const data = await res.json();
    setFormValues(prev => ({
      ...initialFormValues,
      ...prev,
      companyName: toTitleCase(data.razao_social || ''),
      companyOwner: toTitleCase(data.qsa?.[0]?.nome_socio || ''),
      companyPhone: maskPhone(data.ddd_telefone_1 + data.numero_telefone_1) || '',
      addressZipCode: maskZipCode(data.cep) || '',
      addressStreet: toTitleCase(data?.logradouro) || '',
      addressNumber: data?.numero || '',
      addressComplement: toTitleCase(data?.complemento) || '',
      addressNeighborhood: toTitleCase(data?.bairro) || '',
      addressCity: toTitleCase(data?.municipio) || '',
      addressState: data?.uf || '',
      addressCountry: 'BR',
    }));
  } catch {
    toast.error('Erro ao buscar CNPJ');
  }
};

export const fetchCEPData = async (
  cep: string,
  setFormValues: React.Dispatch<
    React.SetStateAction<Record<string, string | boolean | File | null>>
  >
) => {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    if (!res.ok) toast.warning('CEP não encontrado');
    const data = await res.json();
    console.log(data);
    setFormValues(prev => ({
      ...prev,
      addressStreet: toTitleCase(data.street || ''),
      addressNeighborhood: toTitleCase(data.neighborhood || ''),
      addressCity: toTitleCase(data.city || ''),
      addressState: data.state || '',
      addressCountry: 'BR',
    }));
  } catch {
    toast.error('Erro ao buscar CEP');
  }
};
