"use client";

import { useState } from "react";
import EditForm from "@/components/Forms/EditForm";
import api from "@/lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  labs?: Array<{ id: number; isStaff?: boolean }>;
  roles?: Array<{ role: { name: string } }>;
}

interface MemberCardProps {
  user: any;
  isStaff: boolean;
  onUpdate?: (updatedUser: User) => void;
  labId: number | null;
}


export default function MemberCard({
  user,
  isStaff,
  onUpdate,
  labId,
}: MemberCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleActiveStatus = async () => {
    try {
      setLoading(true);
      const updatedUser = await api.patch(`/users/${user.id}`, {
        isActive: !user.isActive,
      });

      if (onUpdate) {
        onUpdate({ 
          ...updatedUser.data, 
          labs: user.labs || [], 
          roles: user.roles || [] 
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleForLab = () => {
    if (!user) return "aluno";
    
    // Verifica se é superuser (role global)
    const isSuperuser = user.roles?.some((r: any) => 
      r.role?.name?.toLowerCase() === "superuser"
    );
    if (isSuperuser) return "superuser";

    // Verifica se é staff no lab específico
    if (labId) {
      const userLab = user.labs?.find((lab: any) => lab.id === labId);
      if (userLab?.isStaff) return "staff";
    }

    return "aluno";
  };
  const roleName = getUserRoleForLab();

  const roleColors: Record<string, string> = {
    staff: "bg-blue-200 text-blue-800",
    superuser: "bg-purple-200 text-purple-800",
    aluno: "bg-orange-200 text-orange-800",
  };

  const statusColors = {
    active: "bg-green-200 text-green-800",
    inactive: "bg-red-200 text-red-800"
  };

  const roleClass = roleColors[roleName.toLowerCase()] || "bg-gray-200 text-gray-800";
  const statusClass = user.isActive ? statusColors.active : statusColors.inactive;

  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-black/5 transition-transform duration-300 hover:scale-[1.01]">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold md:text-lg">{user.username}</h2>
          <p className="text-xs md:text-sm text-gray-600">{user.email}</p>
        </div>

        <div className="flex gap-2 text-xs font-bold justify-end">
          <span className={`px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm shadow-md ${roleClass}`}>
            {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm shadow-md ${statusClass}`}>
            {user.isActive ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {isStaff && (
        <div className="flex gap-2 mt-2 w-full">
          <button
            className="w-1/2 text-sm font-bold cursor-pointer bg-background border border-2 border-gray-200 p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(true)}
          >
            Editar
          </button>
          <button
            className={`w-1/2 text-sm font-bold cursor-pointer text-white p-2 rounded-lg shadow-md border border-2 transition-colors ${
              user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={toggleActiveStatus}
            disabled={loading}
          >
            {loading ? "..." : user.isActive ? "Desativar" : "Ativar"}
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-80 sm:w-full max-w-md relative">
            <button
              className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Usuário</h2>
            <EditForm
              initialData={{
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.isActive ? "ativo" : "inativo",
                labs: user.labs || [],
              }}
              onClose={() => setOpen(false)}
              onSave={(updatedUser) => {
                if (onUpdate) onUpdate({
                  ...updatedUser,
                  roles: updatedUser.roles || user.roles,
                  labs: updatedUser.labs || user.labs
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}