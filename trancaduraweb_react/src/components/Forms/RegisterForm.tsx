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
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  const [staffRoleId, setStaffRoleId] = useState<number | null>(null);

  // Buscar labs onde o usuário é staff e roleId da role "staff"
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const userRes = await api.get("/users/me");
        const userId = userRes.data.userId;

        const labsRes = await api.get("/labs/me");
        const labsStaffOnly = labsRes.data.filter((lab: any) =>
          lab.users?.some((u: any) => u.userId === userId && u.isStaff)
        );
        setLabs(labsStaffOnly);

        const rolesRes = await api.get("/roles");
        const staffRole = rolesRes.data.find(
          (role: any) => role.name === "staff"
        );
        if (staffRole) {
          setStaffRoleId(staffRole.id);
        } else {
          console.warn("Role 'staff' não encontrada");
        }
      } catch (err) {
        console.error("Erro ao buscar dados iniciais:", err);
      }
    }

    fetchInitialData();
  }, []);

  const handleLabSelect = (labId: number) => {
    setSelectedLabs((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId]
    );
  };

  const handleStaffChange = (labId: number, isStaff: boolean) => {
    setLabsStaff((prev) => ({ ...prev, [labId]: isStaff }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isActive = status === "ativo";

      // Criação do usuário
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
        isActive,
        labs: selectedLabs.map((labId) => ({
          labId,
          isStaff: !!labsStaff[labId],
        })),
      });

      const newUser = response.data.user;
      const userId = newUser.id;

      // Prepara os dados para associação aos labs
      const labsToSend = selectedLabs.map((labId) => ({
        userId,
        labId,
        isStaff: !!labsStaff[labId],
      }));

      // Adiciona usuário aos laboratórios
      if (labsToSend.length > 0) {
        for (const lab of labsToSend) {
          await api.post("/labs/add-users", {
            labId: lab.labId,
            users: [{ userId, isStaff: lab.isStaff }],
          });
        }
      }

      // Se for staff em algum lab, atribui a role
      const isStaffAnywhere = labsToSend.some((l) => l.isStaff);
      if (isStaffAnywhere && staffRoleId !== null) {
        await api.post("/roles/assign", {
          userId,
          roleId: staffRoleId,
        });
      }

      if (onSave) onSave(newUser);
      if (onClose) onClose();
    } catch (error: any) {
      console.error(
        "Erro ao registrar usuário:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };
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
          Selecionar Laboratórios
        </label>
        <div className="flex flex-col gap-2">
          {labs.map((lab) => (
            <div key={lab.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedLabs.includes(lab.id)}
                onChange={() => handleLabSelect(lab.id)}
                id={`lab-${lab.id}`}
              />
              <label htmlFor={`lab-${lab.id}`}>{lab.name}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Subcampo para staff em cada lab selecionado */}
      {selectedLabs.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Definir permissões de Staff por laboratório
          </label>
          <div className="flex flex-col gap-2">
            {selectedLabs.map((labId) => {
              const lab = labs.find((l) => l.id === labId);
              return (
                <div key={labId} className="flex items-center gap-2">
                  <span>{lab?.name}</span>
                  <select
                    className="border rounded p-1"
                    value={labsStaff[labId] ? "staff" : "default"}
                    onChange={(e) =>
                      handleStaffChange(labId, e.target.value === "staff")
                    }
                  >
                    <option value="default">Colaborador</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
