"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function doLogout() {
      try {
        await api.post("/auth/logout");
      } catch (err) {
        console.error("Erro ao deslogar:", err);
      } finally {
        router.replace("/");
      }
    }
    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-700 text-lg">
        {loading ? "Saindo..." : "Redirecionando..."}
      </p>
    </div>
  );
}
