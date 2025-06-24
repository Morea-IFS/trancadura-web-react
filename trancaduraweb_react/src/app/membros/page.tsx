"use client";

import { useState } from "react";
import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";
import RegisterForm from "@/components/Forms/RegisterForm";
import { LiaUserFriendsSolid } from "react-icons/lia";

export default function Membros() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <header>
        <Header />
      </header>
      <section className="p-4 md:w-[70%] mx-auto">
        <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex gap-2 items-center">
                <LiaUserFriendsSolid className="w-4 h-4 sm:w-6 sm:h-6 text-foreground font-bold" />
                <p className="text-lg sm:text-2xl font-bold">
                  Gerenciamento de Membros
                </p>
              </div>
              <div className="text-gray-600 text-base sm:text-lg">
                <p>Cadastre e gerencie usuários do sistema</p>
              </div>
            </div>
            <div>
              <button
                className="text-sm font-bold px-4 py-2 bg-green-500 text-white rounded-lg shadow-md border border-2 border-green-600 transition duration-200 hover:bg-green-600 hover:text-white flex items-center justify-center"
                onClick={() => setOpen(true)}
              >
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ Novo Membro</span>
              </button>
            </div>
          </div>
          <MemberCard />
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 sm:w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Registrar Novo Membro
            </h2>
            <RegisterForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
