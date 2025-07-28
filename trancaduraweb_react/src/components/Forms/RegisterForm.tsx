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
import { IoPersonCircle, IoMailOpenOutline, IoLockClosedOutline } from "react-icons/io5";
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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    status: "ativo" as "ativo" | "inativo",
  });
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  const [error, setError] = useState("");

  // Busca os laboratórios disponíveis
  useEffect(() => {
    async function fetchLabs() {
      try {
        const res = await api.get("/labs/me");
        setLabs(res.data);
      } catch (err) {
        console.error("Erro ao carregar laboratórios:", err);
      }
    }
    fetchLabs();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validação básica
      if (!formData.username || !formData.email || !formData.password) {
        setError("Preencha todos os campos obrigatórios");
        return;
      }

      const response = await api.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        isActive: formData.status === "ativo",
        labs: selectedLabs.map((labId) => ({
          labId,
          isStaff: !!labsStaff[labId],
        })),
      });

      if (onSave) onSave(response.data);
      if (onClose) onClose();

    } catch (error: any) {
      console.error("Erro no registro:", error);
      setError(error.response?.data?.message || "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* Nome */}
      <div>
        <div className="flex items-center gap-1">
          <IoPersonCircle className="w-4 h-4 text-blue-400" />
          <label>Nome</label>
        </div>
        <input
          type="text"
          name="username"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Nome do usuário"
          value={formData.username}
          onChange={handleChange}
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
          name="email"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
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
          name="password"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {/* Status */}
      <div>
        <div className="flex items-center gap-1">
          <HiOutlineStatusOnline className="w-4 h-4 text-blue-400" />
          <label>Status</label>
        </div>
        <Listbox 
          value={formData.status} 
          onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <div className="relative mt-1">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-3 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm flex justify-between items-center">
              {statusOptions.find((opt) => opt.value === formData.status)?.label}
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
            <div key={`lab-${lab.id}`} className="flex items-center gap-2"> {/* Adicionei a key aqui */}
              <input
                type="checkbox"
                id={`lab-checkbox-${lab.id}`}
                checked={selectedLabs.includes(lab.id)}
                onChange={() => handleLabSelect(lab.id)}
              />
              <label htmlFor={`lab-checkbox-${lab.id}`}>{lab.name}</label>
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
                <div key={`staff-${labId}`} className="flex items-center gap-2">
                  <span className="w-24">{lab?.name}</span>
                  <Listbox
                    value={currentValue}
                    onChange={(val) => handleStaffChange(labId, val === "staff")}
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
                              selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"
                            }`
                          }
                        >
                          Colaborador
                        </ListboxOption>

                        <ListboxOption
                          value="staff"
                          className={({ selected }) =>
                            `cursor-pointer select-none rounded p-2 ${
                              selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"
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