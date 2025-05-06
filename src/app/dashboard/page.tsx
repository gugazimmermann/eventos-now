"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";

export default function Home() {
  const title = process.env.NEXT_PUBLIC_TITLE || "Eventos Now";

  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyName() {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data.success && data.company && data.company.name) {
        setCompanyName(data.company.name);
      } else {
        setCompanyName(null);
      }
    }
    fetchCompanyName();
  }, []);

  return (
    <DashboardLayout companyName={companyName}>
      <div className="flex flex-col items-center justify-center min-h-screen gap-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div>
          <span className="font-semibold">Company Name: </span>
          {companyName !== null ? companyName : "Carregando..."}
        </div>
      </div>
    </DashboardLayout>
  );
}
