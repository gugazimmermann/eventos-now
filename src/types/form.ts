import { z } from 'zod';

export type FormField = {
  name: string;
  type: string;
};

export type FormValues = Record<string, string | boolean | File | null>;

export interface UseBaseFormProps<T extends FormValues> {
  initialValues?: FormValues;
  fields: FormField[];
  validationSchema?: z.ZodType<T>;
}
