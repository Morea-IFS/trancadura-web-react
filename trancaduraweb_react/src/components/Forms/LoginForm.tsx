"use client";

import { useState } from "react";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!usuario || !password) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        username: usuario,
        password,
      });
      if (res.data && res.data.access_token) {
        router.push("/");
        console.log("Login bem sucedido");
      } else {
        console.log("O login deu errado.");
      }
    } catch (err: any) {
      setErro("Usuário ou senha estão incorretos.");
      console.log("Está faltando dados para o login.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 md:text-xl"
    >
      <div>{erro && <p className="text-red-500 text-sm">{erro}</p>}</div>
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
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="cursor-pointer bg-gradient-to-r from-blue-800 to-teal-500 text-white text-xl md:text-2xl px-6 py-2 rounded-lg font-bold shadow-md transition hover:opacity-90"
        >
          Entrar
        </button>
        <button
          type="submit"
          className="cursor-pointer text-lg md:text-xl px-6 py-2 rounded-lg font-bold shadow-md transition hover:opacity-90 bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent"
        >
          Redefinir Senha
        </button>
      </div>
    </form>
  );
}
