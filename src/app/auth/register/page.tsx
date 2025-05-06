"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AuthForm from "@/app/auth/components/AuthForm";
import { fetchCNPJData, fetchCEPData } from "@/utils/fetchers";
import { registerSchema } from "@/schemas/auth/register";
import { fields } from "./fields";
import { maskers } from "./maskers";

export default function RegisterPage() {
  const router = useRouter();

  const initialFormValues = useMemo(() => {
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      values[field.name] = "";
    });
    return values;
  }, []);

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialFormValues);

  const handleFormChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "companyDocument") {
      const cnpjNumbers = value.replace(/\D/g, "");
      if (cnpjNumbers.length === 14) {
        fetchCNPJData(cnpjNumbers, initialFormValues, setFormValues);
      }
    }

    if (name === "addressZipCode") {
      const cepNumbers = value.replace(/\D/g, "");
      if (cepNumbers.length === 8) {
        fetchCEPData(cepNumbers, setFormValues);
      }
    }
  };

  const handleSubmit = async (form: Record<string, string>) => {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        toast.error(err.message);
      });
      return;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Registro realizado com sucesso!");
      router.push(`/auth/confirm?email=${encodeURIComponent(form.email)}`);
    } else {
      toast.error("Erro ao registrar: " + (data.error || "Erro desconhecido"));
    }
  };

  return (
    <AuthForm
      title="Registro"
      submitLabel="Registrar"
      columns={2}
      maxWidth="max-w-4xl"
      fields={fields}
      onSubmit={handleSubmit}
      maskers={maskers}
      values={formValues}
      onChange={handleFormChange}
      links={[{ text: "Já tem uma conta? Entrar", href: "/auth/login" }]}
    />
  );
}
