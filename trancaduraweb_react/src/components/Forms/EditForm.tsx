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
  IoKeypadOutline,
} from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuHotel } from "react-icons/lu";
import { FiChevronsDown, FiEdit3 } from "react-icons/fi"; // Adicionei FiEdit3
import { FaRegIdCard } from "react-icons/fa";

interface EditFormProps {
  initialData?: {
    id?: number;
    username?: string;
    email?: string;
    status?: "ativo" | "inativo";
    accessPin?: string;
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
  const [accessPin, setAccessPin] = useState(initialData?.accessPin || ""); 
  
  const [status, setStatus] = useState<"ativo" | "inativo">(
    initialData?.status || "ativo"
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState(""); // NOVO: Estado para editar o nome do cartão
  const [initiallyLinkedCard, setInitiallyLinkedCard] = useState<Card | null>(null);
  const [availableCards, setAvailableCards] = useState<Card[]>([]);

  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<number[]>([]);
  const [labsStaff, setLabsStaff] = useState<{ [labId: number]: boolean }>({});
  const [staffRoleId, setStaffRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca os dados iniciais
  useEffect(() => {
    async function fetchData() {
      if (!initialData?.id) return;

      try {
        // Busca os cartões disponíveis
        const availableCardsRes = await api.get("/approximations/available");
        setAvailableCards(availableCardsRes.data);

        // Busca o cartão atualmente vinculado
        const linkedCardsRes = await api.get(`/users/${initialData.id}/cards`);
        if (linkedCardsRes.data && linkedCardsRes.data.length > 0) {
          const currentCard = linkedCardsRes.data[0].approximation;
          setInitiallyLinkedCard(currentCard);
          setSelectedCardId(currentCard.cardId);
          setCardName(currentCard.name || ""); // Preenche o nome para edição
        }

        const me = await api.get("/users/me");
        const currentUserId = me.data.userId;
        const isSuperUser = me.data.roles?.some((r: any) => r.role.name === "superuser");

        let labsToShow;
        if (isSuperUser) {
          const allLabs = await api.get("/labs");
          labsToShow = allLabs.data;
        } else {
          const myLabs = await api.get("/labs/me");
          labsToShow = myLabs.data.filter((lab: any) => 
            lab.users?.some((u: any) => u.userId === currentUserId && u.isStaff)
          );
        }

        setLabs(labsToShow);

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

  // Atualiza o nome do cartão no input quando o cartão selecionado muda
  useEffect(() => {
    if (selectedCardId) {
      // Tenta achar nos disponíveis ou no vinculado inicialmente
      const card = availableCards.find(c => c.cardId === selectedCardId) || 
                   (initiallyLinkedCard?.cardId === selectedCardId ? initiallyLinkedCard : null);
      
      if (card) {
        setCardName(card.name);
      }
    } else {
      setCardName("");
    }
  }, [selectedCardId, availableCards, initiallyLinkedCard]);


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
      // 1. Atualiza vínculo e NOME do cartão
      if (selectedCardId) {
         // Se mudou o cartão vinculado
         if (selectedCardId !== initiallyLinkedCard?.cardId) {
            if (initiallyLinkedCard) {
              await api.delete(`/users/${initialData.id}/cards/${initiallyLinkedCard.id}`);
            }
            await api.post(`/users/${initialData.id}/link-card`, { cardId: selectedCardId });
         }

         // NOVO: Atualiza o nome do cartão se tiver mudado
         // Precisamos do ID numérico (pk) do cartão, não o hexId
         const cardObj = availableCards.find(c => c.cardId === selectedCardId) || initiallyLinkedCard;
         if (cardObj && cardName !== cardObj.name) {
            await api.put(`/approximations/${cardObj.id}`, { name: cardName });
         }
      } else if (initiallyLinkedCard) {
         // Se removeu o cartão
         await api.delete(`/users/${initialData.id}/cards/${initiallyLinkedCard.id}`);
      }

      await api.patch(`/users/${initialData.id}`, {
        username,
        email,
        password: password || undefined,
        isActive: status === "ativo",
        accessPin: accessPin || null,
      });

      const labsToSend = selectedLabs.map((labId) => ({
        userId: initialData.id!,
        labId,
        isStaff: !!labsStaff[labId],
      }));

      await api.post("/labs/remove-users", {
        labIds: selectedLabs,
        userId: initialData.id,
      });

      for (const lab of labsToSend) {
        await api.post("/labs/add-users", {
          labId: lab.labId,
          users: [{ userId: lab.userId, isStaff: lab.isStaff }],
        });
      }

      const isStaffAnywhere = labsToSend.some((l) => l.isStaff);
      if (staffRoleId !== null) {
        if (isStaffAnywhere) {
          await api.post("/roles/assign", {
            userId: initialData.id,
            roleId: staffRoleId,
          });
        } else {
          await api.delete(`/roles/user/${initialData.id}/role-name/staff`);
        }
      }

      if (onSave) {
        onSave({
          id: initialData.id,
          username,
          email,
          isActive: status === "ativo",
          accessPin,
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Nome */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoPersonCircle className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Nome</label>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome do usuário"
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
        />
      </div>

      {/* Email */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoMailOpenOutline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">E-Mail</label>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
        />
      </div>

      {/* Senha */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <IoLockClosedOutline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Nova Senha</label>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Vazio para manter"
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
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
          value={accessPin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setAccessPin(val);
          }}
        />
      </div>

      {/* Status */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <HiOutlineStatusOnline className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Status</label>
        </div>
        <Listbox value={status} onChange={setStatus}>
          <div className="relative">
            <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 text-sm border border-gray-300 shadow-sm flex justify-between items-center h-[38px]">
              {statusOptions.find((opt) => opt.value === status)?.label}
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

      {/* Cartão Vinculado e Edição de Nome */}
      <div className="col-span-1">
        <div className="flex items-center gap-1 mb-1">
          <FaRegIdCard className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Cartão Vinculado</label>
        </div>
        <div className="flex flex-col gap-2">
            {/* Dropdown de Seleção */}
            <Listbox value={selectedCardId} onChange={setSelectedCardId}>
            <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 text-sm border border-gray-300 shadow-sm flex justify-between items-center h-[38px]">
                <span className="block truncate">{selectedCardName}</span>
                <FiChevronsDown className="h-4 w-4 text-gray-600" />
                </ListboxButton>
                <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5">
                <ListboxOption
                    value={null}
                    className="cursor-pointer p-2 hover:bg-gray-100"
                >
                    Sem cartão
                </ListboxOption>
                {cardOptions.map((card) => (
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
                ))}
                </ListboxOptions>
            </div>
            </Listbox>

            {/* Input para Renomear o Cartão (Só aparece se tiver cartão selecionado) */}
            {selectedCardId && (
                <div className="flex items-center gap-2">
                    <FiEdit3 className="text-gray-400" />
                    <input 
                        type="text" 
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Nome/Apelido do Cartão"
                        className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none text-sm p-1"
                    />
                </div>
            )}
        </div>
      </div>

      {/* Salas (Labs) */}
      <div className="col-span-full">
        {/* ... (resto do componente igual) ... */}
        <div className="flex items-center gap-1 mb-1">
          <LuHotel className="w-4 h-4 text-blue-400" />
          <label className="text-sm font-medium">Laboratórios</label>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
          {labs.map((lab) => (
            <div key={lab.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`lab-${lab.id}`}
                className="w-4 h-4"
                checked={selectedLabs.includes(lab.id)}
                onChange={() => handleLabSelect(lab.id)}
              />
              <label htmlFor={`lab-${lab.id}`} className="text-sm cursor-pointer">
                {lab.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedLabs.length > 0 && (
        <div className="col-span-full">
            {/* ... (Renderização das permissões de staff - igual) ... */}
           <label className="block text-sm font-medium mb-1">
            Permissões de Staff
          </label>
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-1">
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
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}