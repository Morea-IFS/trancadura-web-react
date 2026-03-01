"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

// Import dos ícones
import { FiChevronsDown } from "react-icons/fi";
import {
  IoPersonCircle,
  IoMailOpenOutline,
  IoLockClosedOutline,
  IoKeypadOutline,
} from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuHotel } from "react-icons/lu";
import { FaRegIdCard } from "react-icons/fa";

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

interface RegisterFormProps {
  onClose?: () => void;
  onSave?: (newUser: any) => void;
}

interface Card {
  id: number;
  cardId: string;
  name: string;
}

export default function RegisterForm({ onClose, onSave }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    status: "ativo" as "ativo" | "inativo",
    accessPin: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  
  // Estados para o cartão
  const [availableCards, setAvailableCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [error, setError] = useState("");

  // Busca os laboratórios e cartões disponíveis
  useEffect(() => {
    async function fetchData() {
      try {
        const [labsRes, cardsRes] = await Promise.all([
          api.get("/labs/me"),
          api.get("/approximations/available")
        ]);
        
        setLabs(labsRes.data);
        setAvailableCards(cardsRes.data);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
    fetchData();
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validação básica
      if (!formData.username || !formData.email || !formData.password) {
        setError("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      // 1. Cria o usuário
      const response = await api.post("/auth/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        isActive: formData.status === "ativo",
        labs: selectedLabs.map((labId) => ({
          labId,
          isStaff: !!labsStaff[labId],
        })),
        accessPin: formData.accessPin || undefined,
      });

      const newUser = response.data.user || response.data;

      // 2. Se um cartão foi selecionado, vincula ao usuário recém-criado
      if (selectedCardId && newUser.id) {
        try {
          await api.post(`/users/${newUser.id}/link-card`, { 
            cardId: selectedCardId 
          });
        } catch (linkError) {
          console.error("Usuário criado, mas erro ao vincular cartão:", linkError);
          alert("Usuário criado, mas houve um erro ao vincular o cartão. Tente vincular manualmente na edição.");
        }
      }

      if (onSave) onSave(response.data);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Erro no registro:", error);
      setError(error.response?.data?.message || "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  const selectedCardName = availableCards.find(c => c.cardId === selectedCardId)?.name || "Sem cartão";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && <div className="col-span-full text-red-500 text-sm text-center font-semibold">{error}</div>}

      {/* Nome */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoPersonCircle className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Nome</label>
        </div>
        <input
          type="text"
          name="username"
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Nome do usuário"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      {/* Email */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoMailOpenOutline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">E-mail</label>
        </div>
        <input
          type="email"
          name="email"
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      {/* Senha */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoLockClosedOutline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Senha</label>
        </div>
        <input
          type="password"
          name="password"
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {/* Access PIN */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoKeypadOutline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">PIN de Acesso</label>
        </div>
        <input
          type="text"
          name="accessPin"
          maxLength={6}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          placeholder="Ex: 123456"
          value={formData.accessPin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, accessPin: val }))
          }}
        />
      </div>

      {/* LinkCard (Agora com Listbox) */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <FaRegIdCard className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Vincular Cartão</label>
        </div>
        <Listbox value={selectedCardId} onChange={setSelectedCardId}>
          <div className="relative">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 text-sm border border-gray-300 shadow-sm flex justify-between items-center h-[38px]">
              <span className="block truncate">{selectedCardName}</span>
              <FiChevronsDown className="h-4 w-4 text-gray-600" />
            </ListboxButton>
            <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5">
              <ListboxOption
                value={null}
                className="cursor-pointer p-2 hover:bg-gray-100 text-gray-500 italic"
              >
                Nenhum cartão
              </ListboxOption>
              {availableCards.length > 0 ? (
                availableCards.map((card) => (
                  <ListboxOption
                    key={card.id}
                    value={card.cardId}
                    className={({ selected }) =>
                      `cursor-pointer p-2 rounded ${
                        selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"
                      }`
                    }
                  >
                    {card.name} ({card.cardId.substring(0, 6)}...)
                  </ListboxOption>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-center">Nenhum cartão disponível</div>
              )}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

      {/* Status */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <HiOutlineStatusOnline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Status</label>
        </div>
        <Listbox
          value={formData.status}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, status: value }))
          }
        >
          <div className="relative">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 text-sm border border-gray-300 shadow-sm flex justify-between items-center h-[38px]">
              {statusOptions.find((opt) => opt.value === formData.status)?.label}
              <FiChevronsDown className="h-4 w-4 text-gray-600" />
            </ListboxButton>
            <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5">
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

      {/* Laboratórios (Ocupa largura total e tem scroll) */}
      <div className="col-span-full">
        <div className="flex items-center gap-1 mb-1">
          <LuHotel className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Selecionar Laboratórios</label>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
          {labs.length > 0 ? (
            labs.map((lab) => (
              <div key={`lab-${lab.id}`} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`lab-checkbox-${lab.id}`}
                  className="w-4 h-4"
                  checked={selectedLabs.includes(lab.id)}
                  onChange={() => handleLabSelect(lab.id)}
                />
                <label htmlFor={`lab-checkbox-${lab.id}`} className="text-sm cursor-pointer">
                  {lab.name}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center">Nenhum laboratório disponível.</p>
          )}
        </div>
      </div>

      {/* Permissões Staff por laboratório */}
      {selectedLabs.length > 0 && (
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-1">
            Definir permissões de Staff
          </label>
          <div className="flex flex-col gap-2 max-h-32 pr-1">
            {selectedLabs.map((labId) => {
              const lab = labs.find((l) => l.id === labId);
              const currentValue = labsStaff[labId] ? "staff" : "default";

              return (
                <div
                  key={labId}
                  className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1"
                >
                  <span className="text-sm truncate flex-1">{lab?.name}</span>
                  <Listbox
                    value={currentValue}
                    onChange={(val) => handleStaffChange(labId, val === "staff")}
                  >
                    <div className="relative w-36">
                      <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-1 px-2 text-left text-xs border border-gray-300 flex justify-between items-center">
                        {currentValue === "staff" ? "Staff" : "Colaborador"}
                        <FiChevronsDown className="h-3 w-3 text-gray-600" />
                      </ListboxButton>
                      <ListboxOptions className="absolute z-50 mt-1 w-full rounded-md bg-white text-xs shadow-lg border border-gray-200">
                        <ListboxOption
                          value="default"
                          className="cursor-pointer p-2 hover:bg-gray-100"
                        >
                          Colaborador
                        </ListboxOption>
                        <ListboxOption
                          value="staff"
                          className="cursor-pointer p-2 hover:bg-gray-100"
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
      <div className="col-span-full flex gap-3 mt-2 pt-2 border-t border-gray-100">
        {onClose && (
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-lime-500 text-white text-sm font-bold rounded-md shadow-md hover:opacity-90 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}