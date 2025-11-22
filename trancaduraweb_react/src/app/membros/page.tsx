"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MemberCard from "@/components/MemberCard";
import RegisterForm from "@/components/Forms/RegisterForm";
import ScanCardButton from "@/components/ScanCardButton";

// Import dos ícones
import { IoPeopleSharp } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import { LuTriangleAlert } from "react-icons/lu";
import api from "@/lib/api";
import { FaPlus } from "react-icons/fa";
import { LuShield } from "react-icons/lu";

interface LabUser {
  userId: number;
  isStaff?: boolean;
}

interface UserDetails {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  labs?: Array<{ id: number; isStaff?: boolean }>;
  roles?: Array<{ role: { name: string } }>;
}

export default function Membros() {
  const [users, setUsers] = useState<any[]>([]);
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [scanCardModalOpen, setScanCardModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Estado para armazenar os laboratórios do usuário
  useEffect(() => {
    async function fetchRoles() {
      try {
        const userRes = await api.get("/users/me");
        setCurrentUserId(userRes.data.userId);

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

  // Busca os laboratórios do usuário
  useEffect(() => {
    if (!labSelecionado) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get(`/labs/${labSelecionado}`);
        const labUsers: LabUser[] = res.data.users || [];

        const usersWithDetails = await Promise.all(
          labUsers.map(async (u: LabUser) => {
            try {
              const userRes = await api.get(`/users/${u.userId}`);
              return {
                ...userRes.data,
                id: u.userId, // Garante que o ID está presente
                labs: userRes.data.labs?.filter((lab: any) => lab.id === labSelecionado) || []
              };
            } catch (error) {
              console.error(`Erro ao buscar detalhes do usuário ${u.userId}:`, error);
              return null;
            }
          })
        );

        // Filtra quaisquer usuários nulos e garante que cada um tem um ID
        setUsers(usersWithDetails.filter((u): u is UserDetails => u !== null && !!u.id));
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [labSelecionado]);

  // Função para atualizar o usuário na lista
  function handleUserUpdate(updatedUser: any) {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }

  // Função para adicionar um novo usuário à lista
  function handleUserAdd(newUser: any) {
    // Verifica se o novo usuário tem um ID e não está já na lista
    if (newUser.id && !users.some(u => u.id === newUser.id)) {
      setUsers(prevUsers => [...prevUsers, {
        ...newUser,
        // Garante que as propriedades necessárias existam
        labs: newUser.labs || [],
        roles: newUser.roles || []
      }]);
    }
  }

  const podeGerenciar = isSuperuser || isStaff;

  const total = users.length;
  const ativos = users.filter((u) => u.isActive).length;
  const inativos = total - ativos;

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
        {/* Busca e Adicionar Membros */}
        <div className="w-full flex flex-col md:flex-row gap-2 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Inativa por enquanto..."
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Botões de Ação */}
          {podeGerenciar && (
          <div className="w-full flex flex-col md:flex-row gap-4 mt-4">
            <button
              className="w-full md:w-1/2 p-3 bg-gradient-to-r from-green-500 to-lime-300 text-white font-bold rounded-lg shadow-md hover:scale-105 transition"
              onClick={() => setRegisterModalOpen(true)}
            >
              Adicionar Membro
            </button>
            {/* Escanear cartão */}
            <button
              className="w-full md:w-1/2 p-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-lg shadow-md hover:scale-105 transition"
              onClick={() => setScanCardModalOpen(true)}
            >
              Escanear Novo Cartão
            </button>
          </div>
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
            <div className="space-y-4"> {/* Container para a lista */}
              {users.map((user) => (
                <MemberCard
                  key={`user-${user.id}-${labSelecionado}`} // Key única composta
                  user={user}
                  isStaff={podeGerenciar}
                  onUpdate={handleUserUpdate}
                  labId={labSelecionado}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm mt-4">Nenhum membro encontrado.</p>
          )}
        </div>
      </section>

      {/* Modal de Registro */}
      {registerModalOpen && podeGerenciar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 sm:w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setRegisterModalOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Registrar Novo Membro
            </h2>
            <RegisterForm
              onClose={() => setRegisterModalOpen(false)}
              onSave={(newUser) => {
                handleUserAdd(newUser);
                setRegisterModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 4. Adicione o novo Modal para Escanear Cartão */}
      {scanCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setScanCardModalOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Escanear Novo Cartão
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Selecione o leitor e clique no botão para iniciar. O novo cartão
              ficará disponível para ser vinculado a um usuário.
            </p>
            <ScanCardButton userId={currentUserId} />
          </div>
        </div>
      )}
    </div>
  );
}
