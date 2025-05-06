"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import AuthForm from "@/app/auth/components/AuthForm";
import { resetPasswordSchema } from "@/schemas/auth/reset-password";
import { fields as baseFields } from "./fields";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email");
  const [loading, setLoading] = useState(false);

  const initialFormValues = useMemo(() => {
    const values: Record<string, string> = {};
    baseFields.forEach((field) => {
      values[field.name] = "";
    });
    return values;
  }, []);

  const [formValues, setFormValues] =
    useState<Record<string, string>>(initialFormValues);

  const computedFields = useMemo(() => {
    return baseFields.map((field) =>
      field.name === "email" && emailFromQuery
        ? { ...field, disabled: true }
        : field
    );
  }, [emailFromQuery]);

  const handleChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  useEffect(() => {
    if (emailFromQuery) {
      setFormValues((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [emailFromQuery]);

  const handleSubmit = useCallback(
    async (form: Record<string, string>) => {
      const result = resetPasswordSchema.safeParse(form);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Senha alterada com sucesso!");
          router.push(
            `/auth/login?email=${encodeURIComponent(form.email)}`
          );
        } else {
          toast.error(
            "Erro: " +
              (data.error || "Erro desconhecido")
          );
        }
      } catch {
        toast.error("Erro de rede ao alterar a senha.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <AuthForm
      title="Alterar Senha"
      submitLabel={loading ? "Aguarde..." : "Alterar"}
      fields={computedFields}
      onSubmit={handleSubmit}
      values={formValues}
      onChange={handleChange}
      loading={loading}
      links={[{ text: "Voltar", href: "/auth/login" }]}
    />
  );
}
