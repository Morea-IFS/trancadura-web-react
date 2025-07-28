"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Input from "@/components/Input";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      if (res.data?.access_token) {
        // Armazena os dados de autenticação
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Atualiza o estado global de autenticação (se estiver usando context/redux)
        // router.push para a página inicial
        router.push("/");
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.response?.data?.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Usuário</label>
        <Input
          type="text"
          placeholder="Digite seu usuário"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <Input
          type="password"
          placeholder="Digite sua senha"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        className="text-sm text-blue-600 hover:text-blue-800"
        onClick={() => router.push("/recuperar-senha")}
      >
        Esqueci minha senha
      </button>
    </form>
  );
}