"use client";

import { useState } from "react";
import RegisterForm from "@/components/Forms/EditForm";

export default function MemberCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-sm sm:text-lg md:text-xl">Usuário</h2>
            <p className="text-background text-xs sm:text-sm md:text-base rounded-xl bg-foreground p-1">
              Tipo de Membro
            </p>
            <p className="text-background text-xs sm:text-sm md:text-base rounded-xl bg-foreground p-1">
              Ativo / Inativo
            </p>
          </div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-lg">
            <p>email@email.com</p>
          </div>
          <div className="text-gray-600 text-xs sm:text-sm md:text-lg flex gap-1">
            <p>Último acesso:</p>
            <p>data, hora</p>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-2">
          <button
            className="text-sm w-20 cursor-pointer bg-background border border-2 border-gray-200 p-2 rounded-lg shadow-md"
            onClick={() => setOpen(true)}
          >
            Editar
          </button>
          <button className="text-sm text-background w-20 cursor-pointer bg-red-600 border border-2 border-gray-200 p-2 rounded-lg shadow-md">
            Desativar
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 sm:w-full max-w-md relative">
            <button
              className="cursor-pointer  absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Editar Usuário
            </h2>
            <RegisterForm
              initialData={{
                username: "Usuário",
                email: "email@email.com",
                status: "ativo",
              }}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
