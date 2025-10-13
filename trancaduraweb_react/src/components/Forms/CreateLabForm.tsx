// src/components/Forms/CreateLabForm.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

interface CreateLabFormProps {
  onClose: () => void;
  onSave: (newLab: any) => void;
}

export default function CreateLabForm({ onClose, onSave }: CreateLabFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("O nome do laboratório é obrigatório.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/labs", { name });
      onSave(response.data);
      onClose();
    } catch (err: any) {
      console.error("Erro ao criar laboratório:", err);
      setError(err.response?.data?.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="labName" className="block text-sm font-medium mb-1">
          Nome do Laboratório
        </label>
        <input
          id="labName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Laboratório de Redes"
          className="w-full rounded-md border border-gray-300 p-2 shadow-sm"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="w-1/2 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}