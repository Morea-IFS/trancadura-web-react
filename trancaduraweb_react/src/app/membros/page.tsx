"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";
import RegisterForm from "@/components/Forms/RegisterForm";
import { LiaUserFriendsSolid } from "react-icons/lia";
import axios from "axios";

export default function Membros() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/users/me", { withCredentials: true })
      .then((res) => setIsStaff(res.data.isStaff))
      .catch(() => setIsStaff(false));

    axios
      .get("http://localhost:8080/api/users", { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  }, []);

  function handleUserUpdate(updatedUser: any) {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }

  function handleUserAdd(newUser: any) {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  }

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
                  {isStaff ? "Gerenciamento de Membros" : "Lista de Membros"}
                </p>
              </div>
              <div className="text-gray-600 text-base sm:text-lg">
                <p>
                  {isStaff
                    ? "Cadastre e gerencie usuários do sistema"
                    : "Visualize os membros cadastrados no sistema"}
                </p>
              </div>
            </div>
            <div>
              {isStaff && (
                <button
                  className="text-sm font-bold px-4 py-2 bg-green-500 text-white rounded-lg shadow-md border border-2 border-green-600 transition duration-200 hover:bg-green-600 hover:text-white flex items-center justify-center"
                  onClick={() => setOpen(true)}
                >
                  <span className="sm:hidden">+</span>
                  <span className="hidden sm:inline">+ Novo Membro</span>
                </button>
              )}
            </div>
          </div>

          {users.map((user) => (
            <MemberCard
              key={user.id}
              user={user}
              isStaff={isStaff}
              onUpdate={handleUserUpdate}
            />
          ))}
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
            <RegisterForm
              onClose={() => setOpen(false)}
              onSave={(newUser) => {
                handleUserAdd(newUser);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
