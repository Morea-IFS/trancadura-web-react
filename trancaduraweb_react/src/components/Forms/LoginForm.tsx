"use client";

import { useState } from "react";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Colocar lógica de login aqui
    try {
      const res = await api.post('/api/auth/login', {username: usuario, password});
      if (res.data && res.data.access_token) {
        document.cookie = `token=${res.data.access_token}; path=/`;
        setMensagem("Login bem-sucedido!");
        router.push("/"); // Redireciona para home ou dashboard
      } else {
        setMensagem("Usuário ou senha inválidos");
      }
    } catch (err: any) {
      setMensagem(err.response?.data?.message || "Erro ao fazer login");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 md:text-xl"
    >
      <div>
        <label className="text-foreground text-xl">Usuário</label>
        <Input
          type="text"
          placeholder="Ex: nome.sobrenome"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
      </div>
      <div>
        <label className="text-foreground text-xl">Senha</label>
        <Input
          type="password"
          placeholder="Ex: Total123**"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-white text-xl md:text-2xl px-6 py-2 rounded-lg font-bold shadow-md transition hover:opacity-90"
      >
        Entrar
      </button>
      <p className="text-foreground text-sm sm:text-lg">
        Esqueceu a senha?{" "}
        <a href="#" className="text-primary hover:underline">
          Redefinir senha
        </a>
      </p>
    </form>
  );
}
