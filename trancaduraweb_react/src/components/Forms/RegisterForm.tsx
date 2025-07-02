"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface RegisterFormProps {
  onClose?: () => void;
  onSave?: (newUser: any) => void;
}

export default function RegisterForm({ onClose, onSave }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">("ativo");
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userIsStaff, setUserIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get("/users/me", { withCredentials: true })
      .then((res) => setUserIsStaff(res.data.isStaff))
      .catch(() => setUserIsStaff(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isActive = status === "ativo";

      const response = await api.post("auth/signup", {
        username,
        email,
        password,
        isActive,
        isStaff,
      });

      if (onSave) {
        onSave(response.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error(
        "Erro ao registrar usuário:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (userIsStaff === null) {
    return (
      <p className="text-center text-gray-500">Verificando permissões...</p>
    );
  }

  if (!userIsStaff) {
    return (
      <p className="text-center text-red-600 font-semibold">
        Acesso negado: apenas usuários staff podem registrar membros.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as "ativo" | "inativo")}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tipo de usuário
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2"
          value={isStaff ? "staff" : "aluno"}
          onChange={(e) => setIsStaff(e.target.value === "staff")}
        >
          <option value="aluno">Aluno</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {onClose && (
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}
