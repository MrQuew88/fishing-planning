"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Mot de passe incorrect");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors min-h-[48px]"
        autoFocus
      />
      {error && <p className="text-[#F59E0B] text-base text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white rounded-full px-4 py-3 text-lg font-medium transition-colors border border-white/10 min-h-[48px]"
      >
        {loading ? "..." : "Entrer"}
      </button>
    </form>
  );
}
