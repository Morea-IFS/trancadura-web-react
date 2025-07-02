"use client";

import { useEffect, useState } from "react";
import Input from "@/components/Input";
import api from "@/lib/api";

interface EditFormProps {
  initialData?: {
    id?: number;
    username?: string;
    email?: string;
    status?: "ativo" | "inativo";
    isStaff?: boolean;
  };
  onClose?: () => void;
  onSave?: (updatedUser: any) => void;
}

export default function EditForm({
  initialData,
  onClose,
  onSave,
}: EditFormProps) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"ativo" | "inativo">(
    initialData?.status || "ativo"
  );
  const [isStaff, setIsStaff] = useState(initialData?.isStaff || false);
  const [loading, setLoading] = useState(false);
  const [userIsStaff, setUserIsStaff] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setUserIsStaff(res.data.isStaff))
      .catch(() => setUserIsStaff(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIsStaff) {
      alert("Você não tem permissão para editar usuários.");
      return;
    }

    try {
      setLoading(true);
      if (!initialData?.id) {
        throw new Error("ID do usuário não definido.");
      }
      const response = await api.patch(`/users/${initialData.id}`, {
        username,
        email,
        password: password || undefined,
        isActive: status === "ativo",
        isStaff,
      });

      if (onSave) {
        onSave(response.data);
      }
      if (onClose) onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (userIsStaff === false) {
    return (
      <div className="text-red-600 text-center font-bold">
        Acesso negado: você não tem permissão para editar usuários.
      </div>
    );
  }

  if (userIsStaff === null) {
    return (
      <div className="text-center text-gray-600">Verificando permissões...</div>
    );
  }

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
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-foreground text-white hover:bg-foreground/90 transition cursor-pointer"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
