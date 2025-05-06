"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import AuthForm from "@/app/auth/components/AuthForm";
import { confirmSchema } from "@/schemas/auth/confirm";
import { fields } from "./fields";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email");
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

  useEffect(() => {
    if (emailFromQuery) {
      setFormValues((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [emailFromQuery]);

  const handleSubmit = useCallback(
    async (form: Record<string, string>) => {
      const result = confirmSchema.safeParse(form);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Registro confirmado com sucesso!");
          router.push(`/auth/login?email=${encodeURIComponent(form.email)}`);
        } else {
          toast.error(
            "Erro ao confirmar o registro: " +
              (data.error || "Erro desconhecido")
          );
        }
      } catch {
        toast.error("Erro de rede ao confirmar o registro.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <AuthForm
      title="Confirmar registro"
      submitLabel={loading ? "Confirmando..." : "Confirmar"}
      fields={fields}
      onSubmit={handleSubmit}
      values={formValues}
      onChange={handleChange}
      loading={loading}
    />
  );
}
