export default function Home() {
  const title = process.env.NEXT_PUBLIC_TITLE || "Eventos Now";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <a
        href="/auth/login"
        className="rounded bg-text-light text-white px-6 py-2 text-lg font-semibold hover:bg-text-strong transition-colors"
      >
        Login
      </a>
    </div>
  );
}
