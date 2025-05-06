"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AuthForm from "@/app/auth/components/AuthForm";
import { forgotPasswordSchema } from "@/schemas/auth/forgot-password";
import { fields } from "./fields";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const initialFormValues = useMemo(() => {
    const values: Record<string, string> = {};
    fields.forEach((field) => {
      values[field.name] = "";
    });
    return values;
  }, []);

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialFormValues);

  const handleChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (form: Record<string, string>) => {
      const result = forgotPasswordSchema.safeParse(form);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Email de redefinição de senha enviado com sucesso!");
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(form.email)}`
          );
        } else {
          toast.error("Erro: " + (data.error || "Erro desconhecido"));
        }
      } catch {
        toast.error("Erro de rede ao solicitar redefinição de senha.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <AuthForm
      title="Esqueceu sua senha?"
      submitLabel={loading ? "Aguarde..." : "Enviar"}
      fields={fields}
      onSubmit={handleSubmit}
      values={formValues}
      onChange={handleChange}
      loading={loading}
      links={[{ text: "Voltar", href: "/auth/login" }]}
    />
  );
}
