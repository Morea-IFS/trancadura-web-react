"use client";

import { useState } from "react";
import Input from "@/components/Input";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Colocar lógica de login aqui
    console.log("Logging in with:", { usuario, password });
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
