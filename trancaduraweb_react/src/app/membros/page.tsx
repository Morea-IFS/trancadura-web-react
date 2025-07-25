"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";
import RegisterForm from "@/components/Forms/RegisterForm";
import { IoPeopleSharp } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import { LuTriangleAlert } from "react-icons/lu";
import api from "@/lib/api";
import { FaPlus } from "react-icons/fa";
import { LuShield } from "react-icons/lu";

export default function Membros() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const userRes = await api.get("/users/me");

        const rolesArray: any[] = userRes.data.roles || [];

        const roleNames: string[] = rolesArray
          .map((r) => r?.role?.name)
          .filter(Boolean);

        setIsSuperuser(roleNames.includes("superuser"));

        if (labSelecionado) {
          const labRes = await api.get(`/labs/${labSelecionado}`);

          const userLab = labRes.data.users?.find(
            (u: any) => u.userId === userRes.data.userId
          );

          setIsStaff(!!userLab?.isStaff);
        } else {
          setIsStaff(false);
        }
      } catch (err) {
        console.error("Erro ao buscar roles:", err);
        setIsSuperuser(false);
        setIsStaff(false);
      }
    }

    fetchRoles();
  }, [labSelecionado]);

  useEffect(() => {
    if (!labSelecionado) {
      setUsers([]);
      return;
    }
    api
      .get(`/labs/${labSelecionado}`)
      .then((res) => {
        setUsers(res.data.users?.map((u: any) => u.user) || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários do laboratório:", err);
        setUsers([]);
      });
  }, [labSelecionado]);

  function handleUserUpdate(updatedUser: any) {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }

  function handleUserAdd(newUser: any) {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  }

  const podeGerenciar = isSuperuser || isStaff;

  const total = users.length;
  const ativos = users.filter((u) => u.isActive).length;
  const inativos = total - ativos;
  const porcentagem = total > 0 ? Math.round((ativos / total) * 100) : 0;

  return (
    <div>
      <header>
        <Header
          labSelecionado={labSelecionado}
          setLabSelecionado={setLabSelecionado}
        />
      </header>

      <section className="p-4 md:w-[70%] mx-auto flex flex-col gap-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full font-bold">
          {/* Total */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-fuchsia-300 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Total</div>
              <div className="text-2xl md:text-3xl font-bold">{total}</div>
            </div>
            <IoPeopleSharp className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          {/* Ativos */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-lime-300 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Ativos</div>
              <div className="text-2xl md:text-3xl font-bold">{ativos}</div>
            </div>
            <CiCircleCheck className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
          </div>

          {/* Staff */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Staff</div>
              <div className="text-2xl md:text-3xl font-bold">
                {
                  users.filter((u) =>
                    u.roles?.some((r: any) => r?.role?.name === "staff")
                  ).length
                }
              </div>
            </div>
            <LuShield className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          {/* Inativos */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-red-400 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Inativos</div>
              <div className="text-2xl md:text-3xl font-bold">{inativos}</div>
            </div>
            <LuTriangleAlert className="w-10 h-10 md:w-12 md:h-12" />
          </div>
        </div>

        {/* Busca e e Adicionar Membros */}
        <div className="w-full flex flex-col gap-2 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Inativa por enquanto..."
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {podeGerenciar && (
            <button
              className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-green-500 to-lime-300 text-white rounded-md shadow-lg border border-green-600 flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <FaPlus className="w-4 h-4" />
              <span>Adicionar Membro</span>
            </button>
          )}
        </div>

        {/* Lista de Membros */}
        <div className="p-4 w-full flex flex-col gap-2 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-lime-400 text-white font-bold rounded-md flex items-center justify-center">
              <IoPeopleSharp className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <p className="text-lg font-bold md:text-2xl">
              {podeGerenciar ? "Gerenciamento de Membros" : "Lista de Membros"}
            </p>
          </div>
          <div className="text-sm md:text-lg">
            <p>
              {users.length} membro{users.length === 1 ? "" : "s"} cadastrado
              {users.length === 1 ? "" : "s"} no sistema
            </p>
          </div>
          {/* Lista de Membros */}
          {users.length > 0 ? (
            users.map((user) => (
              <MemberCard
                key={user.id}
                user={user}
                isStaff={podeGerenciar}
                onUpdate={handleUserUpdate}
              />
            ))
          ) : (
            <p className="text-sm mt-4">Nenhum membro encontrado.</p>
          )}
        </div>
      </section>

      {/* Modal de Registro */}
      {open && podeGerenciar && (
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
