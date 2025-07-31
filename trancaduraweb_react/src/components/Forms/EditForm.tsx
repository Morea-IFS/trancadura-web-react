"use client";

import { useEffect, useState } from "react";
import Input from "@/components/Input";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { FiChevronsDown } from "react-icons/fi";

// Import dos ícones
import {
  IoPersonCircle,
  IoMailOpenOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuHotel } from "react-icons/lu";

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

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

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

  // Busca os laboratórios do usuário e o ID da role "staff"
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

        const rolesRes = await api.get("/roles");
        const staff = rolesRes.data.find((r: any) => r.name === "staff");
        if (staff) setStaffRoleId(staff.id);

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

  // Manipula a seleção de laboratórios
  const handleLabSelect = (labId: number) => {
    setSelectedLabs((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId]
    );
  };

  // Manipula a mudança de permissões de staff por laboratório
  const handleStaffChange = (labId: number, isStaff: boolean) => {
    setLabsStaff((prev) => ({ ...prev, [labId]: isStaff }));
  };

  // Envia o formulário de registro
  // Envia o formulário de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) return alert("ID de usuário inválido");

    setLoading(true);
    try {
      // 1. Atualiza os dados básicos do usuário
      await api.patch(`/users/${initialData.id}`, {
        username,
        email,
        password: password || undefined,
        isActive: status === "ativo",
      });

      // 2. Atualiza as associações com laboratórios
      const labsToSend = selectedLabs.map((labId) => ({
        userId: initialData.id!,
        labId,
        isStaff: !!labsStaff[labId],
      }));

      // Primeiro remove todas as associações existentes
      await api.post("/labs/remove-users", {
        labIds: selectedLabs,
        userId: initialData.id,
      });

      // Adiciona as novas associações
      for (const lab of labsToSend) {
        await api.post("/labs/add-users", {
          labId: lab.labId,
          users: [{ userId: lab.userId, isStaff: lab.isStaff }],
        });
      }

      // 3. Atualiza a role staff
      const isStaffAnywhere = labsToSend.some((l) => l.isStaff);
      if (staffRoleId !== null) {
        if (isStaffAnywhere) {
          await api.post("/roles/assign", {
            userId: initialData.id,
            roleId: staffRoleId,
          });
        } else {
          // Remove a role staff completamente
          await api.delete(`/roles/user/${initialData.id}/role-name/staff`);
        }
      }

      // 4. Atualiza o usuário no estado local
      if (onSave) {
        onSave({ 
          id: initialData.id, 
          username, 
          email,
          isActive: status === "ativo",
          labs: labsToSend.map(l => ({
            id: l.labId,
            isStaff: l.isStaff
          })),
          roles: isStaffAnywhere 
            ? [{ role: { name: "staff" } }] 
            : []
        });
      }
      
      if (onClose) onClose();
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("Ocorreu um erro ao salvar as alterações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nome */}
      <div>
        <div className="flex items-center gap-1">
          <IoPersonCircle className="w-4 h-4 text-blue-400" />
          <label>Nome</label>
        </div>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center gap-1">
          <IoMailOpenOutline className="w-4 h-4 text-blue-400" />
          <label>E-Mail</label>
        </div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Senha */}
      <div>
        <div className="flex items-center gap-1">
          <IoLockClosedOutline className="w-4 h-4 text-blue-400" />
          <label>Nova Senha</label>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Deixe em branco para não alterar"
        />
      </div>

      {/* Status */}
      <div>
        <div className="flex items-center gap-1">
          <HiOutlineStatusOnline className="w-4 h-4 text-blue-400" />
          <label>Status</label>
        </div>
        <Listbox value={status} onChange={setStatus}>
          <div className="relative mt-1">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-3 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm">
              {statusOptions.find((opt) => opt.value === status)?.label}
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronsDown className="h-4 w-4 text-gray-600" />
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-2 text-sm shadow-lg ring-1 ring-black/5">
              {statusOptions.map((opt) => (
                <ListboxOption
                  key={opt.value}
                  value={opt.value}
                  className={({ selected }) =>
                    `cursor-pointer select-none p-2 rounded ${
                      selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"
                    }`
                  }
                >
                  {opt.label}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* Salas */}
      <div>
        <div className="flex items-center gap-1">
          <LuHotel className="w-4 h-4 text-blue-400" />
          <label>Sala</label>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2">
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
            Definir permissões por laboratório
          </label>
          <div className="flex flex-col gap-2">
            {selectedLabs.map((labId) => {
              const lab = labs.find((l) => l.id === labId);
              const currentValue = labsStaff[labId] ? "staff" : "default";

              return (
                <div key={labId} className="flex items-center gap-2">
                  <span className="w-24">{lab?.name}</span>

                  <Listbox
                    value={currentValue}
                    onChange={(val) =>
                      handleStaffChange(labId, val === "staff")
                    }
                  >
                    <div className="relative w-full">
                      <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm flex justify-between items-center">
                        {currentValue === "staff" ? "Staff" : "Colaborador"}
                        <FiChevronsDown className="h-4 w-4 text-gray-600" />
                      </ListboxButton>

                      <ListboxOptions className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white p-1 text-sm shadow-lg">
                        <ListboxOption
                          value="default"
                          className={({ selected }) =>
                            `cursor-pointer select-none rounded p-2 ${
                              selected
                                ? "bg-teal-200 font-bold"
                                : "hover:bg-gray-100"
                            }`
                          }
                        >
                          Colaborador
                        </ListboxOption>

                        <ListboxOption
                          value="staff"
                          className={({ selected }) =>
                            `cursor-pointer select-none rounded p-2 ${
                              selected
                                ? "bg-teal-200 font-bold"
                                : "hover:bg-gray-100"
                            }`
                          }
                        >
                          Staff
                        </ListboxOption>
                      </ListboxOptions>
                    </div>
                  </Listbox>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2 mt-4">
        {onClose && (
          <button
            type="button"
            className="w-1/2 px-4 py-2 bg-white border border-black/10 text-gray-700 rounded-md cursor-pointer"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="w-1/2 px-4 py-2 bg-gradient-to-r from-green-500 border border-black/10 to-lime-300 text-white rounded-md cursor-pointer"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
