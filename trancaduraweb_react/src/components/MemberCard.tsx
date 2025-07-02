"use client";

import { useState } from "react";
import EditForm from "@/components/Forms/EditForm";
import api from "@/lib/api";

export default function MemberCard({
  user,
  isStaff,
  onUpdate,
}: {
  user: any;
  isStaff: boolean;
  onUpdate?: (updatedUser: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleActiveStatus = async () => {
    try {
      setLoading(true);
      const updatedUser = await api.patch(`/users/${user.id}`, {
        isActive: !user.isActive,
      });

      if (onUpdate) {
        onUpdate(updatedUser.data);
      }
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-sm sm:text-lg md:text-xl">{user.username}</h2>

            <p
              className={`w-15 text-center text-xs sm:text-sm md:text-base rounded-xl px-2 py-1 ${
                user.isStaff ? "bg-blue-600 text-white" : "bg-black text-white"
              }`}
            >
              {user.isStaff ? "Staff" : "Aluno"}
            </p>

            <p
              className={`w-15 text-center text-xs sm:text-sm md:text-base rounded-xl px-2 py-1 ${
                user.isActive
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {user.isActive ? "Ativo" : "Inativo"}
            </p>
          </div>

          <div className="text-gray-600 text-xs sm:text-sm md:text-lg">
            <p>{user.email}</p>
          </div>
        </div>

        {isStaff && (
          <div className="flex flex-1 justify-end items-center gap-2">
            <button
              className="text-sm w-20 cursor-pointer bg-background border border-2 border-gray-200 p-2 rounded-lg shadow-md"
              onClick={() => setOpen(true)}
            >
              Editar
            </button>
            <button
              className={`text-sm w-20 cursor-pointer text-white p-2 rounded-lg shadow-md border border-2 ${
                user.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              onClick={toggleActiveStatus}
              disabled={loading}
            >
              {loading ? "..." : user.isActive ? "Desativar" : "Ativar"}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 sm:w-full max-w-md relative">
            <button
              className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Editar Usuário
            </h2>
            <EditForm
              initialData={{
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.isActive ? "ativo" : "inativo",
                isStaff: user.isStaff,
              }}
              onClose={() => setOpen(false)}
              onSave={(updatedUser) => {
                if (onUpdate) onUpdate(updatedUser);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
