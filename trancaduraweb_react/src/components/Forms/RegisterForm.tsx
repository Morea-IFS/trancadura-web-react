"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { FiChevronsDown } from "react-icons/fi";

// Import dos Ìcones
import {
  IoPersonCircle,
  IoMailOpenOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuHotel } from "react-icons/lu";

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

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

  // Busca os laboratórios do usuário e o ID da role "staff"
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isActive = status === "ativo";

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

      const labsToSend = selectedLabs.map((labId) => ({
        userId,
        labId,
        isStaff: !!labsStaff[labId],
      }));

      if (labsToSend.length > 0) {
        for (const lab of labsToSend) {
          await api.post("/labs/add-users", {
            labId: lab.labId,
            users: [{ userId, isStaff: lab.isStaff }],
          });
        }
      }

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
      {/* Nome */}
      <div>
        <div className="flex items-center gap-1">
          <IoPersonCircle className="w-4 h-4 text-blue-400" />
          <label>Nome</label>
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Nome do usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center gap-1">
          <IoMailOpenOutline className="w-4 h-4 text-blue-400" />
          <label>E-mail</label>
        </div>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Senha */}
      <div>
        <div className="flex items-center gap-1">
          <IoLockClosedOutline className="w-4 h-4 text-blue-400" />
          <label>Senha</label>
        </div>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-3 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm flex justify-between items-center">
              {statusOptions.find((opt) => opt.value === status)?.label}
              <FiChevronsDown className="h-4 w-4 text-gray-600" />
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

      {/* Laboratórios */}
      <div>
        <div className="flex items-center gap-1">
          <LuHotel className="w-4 h-4 text-blue-400" />
          <label>Selecionar Laboratórios</label>
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

      {/* Permissões Staff por laboratório */}
      {selectedLabs.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Definir permissões de Staff por laboratório
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
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}
