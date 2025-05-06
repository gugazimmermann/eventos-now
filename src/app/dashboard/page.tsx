"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const title = process.env.NEXT_PUBLIC_TITLE || "Eventos Now";

  const router = useRouter();

  // 1. Estado para armazenar o owner
  const [owner, setOwner] = useState<string | null>(null);

  // 2. Buscar o owner ao montar o componente
  useEffect(() => {
    async function fetchOwner() {
      const res = await fetch('/api/me');
      const data = await res.json();
      if (data.success && data.company && data.company.owner) {
        setOwner(data.company.owner);
      } else {
        setOwner(null);
      }
    }
    fetchOwner();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {/* 3. Exibir o owner */}
      <div>
        <span className="font-semibold">Owner: </span>
        {owner !== null ? owner : "Carregando..."}
      </div>
      <button
        onClick={handleLogout}
        className="rounded bg-white text-black px-6 py-2 text-lg font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
