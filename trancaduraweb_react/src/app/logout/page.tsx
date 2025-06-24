"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import axios from "axios";

export default function Logout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8080/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } finally {
      router.replace("/login");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <header className="fixed top-0 left-0 w-full z-10 shadow bg-white">
        <Header />
      </header>

      <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-40 z-20 p-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 flex flex-col items-center max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">
            Deseja realmente sair?
          </h1>
          <p className="mb-6 text-gray-600 text-center">
            Você será desconectado da sua conta.
          </p>
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition w-full"
            >
              {loading ? "Saindo..." : "Sair"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
