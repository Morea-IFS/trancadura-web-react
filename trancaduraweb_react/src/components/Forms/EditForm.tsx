"use client";

import { useState } from "react";
import Input from "@/components/Input";

interface RegisterFormProps {
  initialData?: {
    username?: string;
    email?: string;
    status?: "ativo" | "inativo";
  };
  onClose?: () => void;
}

export default function EditForm({ initialData, onClose }: RegisterFormProps) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">(
    initialData?.status || "ativo"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Colocar lógica de registro/edição aqui
    console.log("Salvando:", { username, email, password, status });
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <Input
          type="text"
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <Input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-foreground"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {onClose && (
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-foreground text-white hover:bg-foreground/90 transition"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
