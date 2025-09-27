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
import {
  IoPersonCircle,
  IoMailOpenOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuHotel } from "react-icons/lu";
import { FiChevronsDown } from "react-icons/fi";
import { FaRegIdCard } from "react-icons/fa";

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

interface Card {
  id: number;
  cardId: string;
  name: string;
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
  const [idCard, setIdCard] = useState(""); // Precisa ser implementado
  const [status, setStatus] = useState<"ativo" | "inativo">(
    initialData?.status || "ativo"
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [initiallyLinkedCard, setInitiallyLinkedCard] = useState<Card | null>(null);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);

  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  const [staffRoleId, setStaffRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca os laboratórios do usuário e o ID da role "staff"
  useEffect(() => {
    async function fetchData() {
      if (!initialData?.id) return;

      try {
        // Busca os cartões disponíveis (não vinculados a ninguém)
        const availableCardsRes = await api.get("/approximations/available");
        setAvailableCards(availableCardsRes.data);

        // Busca o cartão atualmente vinculado a este usuário
        const linkedCardsRes = await api.get(`/users/${initialData.id}/cards`);
        if (linkedCardsRes.data && linkedCardsRes.data.length > 0) {
          const currentCard = linkedCardsRes.data[0].approximation;
          setInitiallyLinkedCard(currentCard);
          setSelectedCardId(currentCard.cardId);
        }

        // 1. Busca dados do usuário atual
        const me = await api.get("/users/me");
        const currentUserId = me.data.userId;
        const isSuperUser = me.data.roles?.some((r: any) => r.role.name === "superuser");

        // 2. Busca os laboratórios
        let labsToShow;
        if (isSuperUser) {
          // Se for superUser, busca todos os laboratórios
          const allLabs = await api.get("/labs");
          labsToShow = allLabs.data;
        } else {
          // Se não for superUser, busca apenas os labs onde é staff
          const myLabs = await api.get("/labs/me");
          labsToShow = myLabs.data.filter((lab: any) => 
            lab.users?.some((u: any) => u.userId === currentUserId && u.isStaff)
          );
        }

        setLabs(labsToShow);

        // 3. Busca o ID da role "staff" (para uso posterior)
        const rolesRes = await api.get("/roles");
        const staff = rolesRes.data.find((r: any) => r.name === "staff");
        if (staff) setStaffRoleId(staff.id);

        // 4. Configura os laboratórios selecionados do usuário sendo editado
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id) return alert("ID de usuário inválido");

    setLoading(true);
    try {
      if (selectedCardId !== initiallyLinkedCard?.cardId) {
        // Se havia um cartão vinculado e agora não há mais (ou mudou), desvincula o antigo
        if (initiallyLinkedCard) {
          await api.delete(`/users/${initialData.id}/cards/${initiallyLinkedCard.id}`); //
        }
        // Se um novo cartão foi selecionado, vincula-o
        if (selectedCardId) {
          await api.post(`/users/${initialData.id}/link-card`, { cardId: selectedCardId }); //
        }
      }

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
          labs: labsToSend.map((l) => ({
            id: l.labId,
            isStaff: l.isStaff,
          })),
          roles: isStaffAnywhere ? [{ role: { name: "staff" } }] : [],
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

  
  const cardOptions = [...availableCards];
  if (initiallyLinkedCard && !cardOptions.some(c => c.id === initiallyLinkedCard.id)) {
    cardOptions.unshift(initiallyLinkedCard);
  }
  const selectedCardName = cardOptions.find(c => c.cardId === selectedCardId)?.name || "Sem cartão";

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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome do usuário"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center gap-1">
          <IoMailOpenOutline className="w-4 h-4 text-blue-400" />
          <label>E-Mail</label>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Senha */}
      <div>
        <div className="flex items-center gap-1">
          <IoLockClosedOutline className="w-4 h-4 text-blue-400" />
          <label>Nova Senha</label>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Deixe em branco para não alterar"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* LinkCard */}
      

      {/* Status */}
      <div>
        <div className="flex items-center gap-1">
          <FaRegIdCard className="w-4 h-4 text-blue-400" />
          <label>Cartão Vinculado</label>
        </div>
        <Listbox value={selectedCardId} onChange={setSelectedCardId}>
          <div className="relative mt-1">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-3 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm">
              <span className="block truncate">{selectedCardName}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronsDown className="h-4 w-4 text-gray-600" />
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-2 text-sm shadow-lg ring-1 ring-black/5">
              <ListboxOption
                key="no-card"
                value={null}
                className={({ selected }) => `cursor-pointer select-none p-2 rounded ${selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"}`}
              >
                Sem cartão
              </ListboxOption>
              {cardOptions.map((card) => (
                <ListboxOption
                  key={card.id}
                  value={card.cardId}
                  className={({ selected }) => `cursor-pointer select-none p-2 rounded ${selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"}`}
                >
                  {card.name} ({card.cardId.substring(0, 6)}...)
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
