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
    labs?: { id: number; name: string; isStaff: boolean }[];
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

  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  const [staffRoleId, setStaffRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const me = await api.get("/users/me");
        const userId = me.data.userId;

        const labsRes = await api.get("/labs/me");
        const labsStaffOnly = labsRes.data.filter((lab: any) =>
          lab.users?.some((u: any) => u.userId === userId && u.isStaff)
        );
        setLabs(labsStaffOnly);

        // Pega as roles disponíveis
        const rolesRes = await api.get("/roles");
        const staff = rolesRes.data.find((r: any) => r.name === "staff");
        if (staff) setStaffRoleId(staff.id);

        // Se vierem dados de labs já associados ao usuário editado
        if (initialData?.labs) {
          setSelectedLabs(initialData.labs.map((lab) => lab.id));
          const staffMap: { [labId: number]: boolean } = {};
          initialData.labs.forEach((lab) => {
            staffMap[lab.id] = lab.isStaff;
          });
          setLabsStaff(staffMap);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }

    fetchData();
  }, [initialData]);

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
    if (!initialData?.id) return alert("ID de usuário inválido");

    setLoading(true);
    try {
      await api.patch(`/users/${initialData.id}`, {
        username,
        email,
        password: password || undefined,
        isActive: status === "ativo",
      });

      // Atualiza vinculação aos labs
      const labsToSend = selectedLabs.map((labId) => ({
        userId: initialData.id!,
        labId,
        isStaff: !!labsStaff[labId],
      }));

      for (const lab of labsToSend) {
        await api.post("/labs/add-users", {
          labId: lab.labId,
          users: [{ userId: lab.userId, isStaff: lab.isStaff }],
        });
      }

      // Atualiza role staff se necessário
      const isStaffAnywhere = labsToSend.some((l) => l.isStaff);
      if (isStaffAnywhere && staffRoleId !== null) {
        await api.post("/roles/assign", {
          userId: initialData.id,
          roleId: staffRoleId,
        });
      }

      if (onSave) onSave({ id: initialData.id, username, email });
      if (onClose) onClose();
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nova senha</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Deixe em branco para não alterar"
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
        <label className="block text-sm font-medium mb-1">Laboratórios</label>
        <div className="flex flex-col gap-2">
          {labs.map((lab) => (
            <div key={lab.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`lab-${lab.id}`}
                checked={selectedLabs.includes(lab.id)}
                onChange={() => handleLabSelect(lab.id)}
              />
              <label htmlFor={`lab-${lab.id}`}>{lab.name}</label>
            </div>
          ))}
        </div>
      </div>

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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
