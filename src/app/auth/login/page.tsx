"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import AuthForm from "@/app/auth/components/AuthForm";
import { loginSchema } from "@/schemas/auth/login";
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
      const result = loginSchema.safeParse(form);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          router.push("/dashboard");
        } else {
          toast.error(
            "Erro: " +
              (data.error || "Erro desconhecido")
          );
        }
      } catch {
        toast.error("Erro de rede ao realizar o login.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <AuthForm
      title="Entrar"
      submitLabel={loading ? "Aguarde..." : "Entrar"}
      fields={computedFields}
      onSubmit={handleSubmit}
      values={formValues}
      onChange={handleChange}
      loading={loading}
      links={[
        { text: "Esqueceu sua senha?", href: "/auth/forgot-password" },
        { text: "Não tem cadastro? Clique aqui!", href: "/auth/register" },
      ]}
    />
  );
}
