// src/components/DeviceCard.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { FiChevronsDown } from "react-icons/fi";
import { LuHotel } from "react-icons/lu";

interface Device {
  id: number;
  location: string;
  macAddress: string;
  ipAddress: string;
  lab?: { id: number; name: string };
}

interface Lab {
  id: number;
  name: string;
}

interface DeviceCardProps {
  device: Device;
  allLabs: Lab[];
  onUpdate: () => void; // Callback para recarregar a lista na página principal
}

export default function DeviceCard({ device, allLabs, onUpdate }: DeviceCardProps) {
  const [selectedLabId, setSelectedLabId] = useState<number | null>(
    device.lab?.id || null
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setSelectedLabId(device.lab?.id || null);
  }, [device]);

  const handleSave = async () => {
    setLoading(true);
    setStatus("idle");

    const initiallyLinkedLabId = device.lab?.id;

    try {
      // Caso 1: O usuário selecionou "Nenhum" para um dispositivo que estava vinculado
      if (initiallyLinkedLabId && selectedLabId === null) {
        // Desvincula o dispositivo do seu laboratório antigo
        await api.patch(`/labs/${initiallyLinkedLabId}`, { deviceId: null });
      } 
      // Caso 2: O usuário selecionou um novo laboratório
      else if (selectedLabId && selectedLabId !== initiallyLinkedLabId) {
        // Vincula o dispositivo ao novo laboratório
        // (Sua API já deve desvincular automaticamente do antigo se houver uma constraint unique)
        await api.patch(`/labs/${selectedLabId}`, { deviceId: device.id });
      }

      setStatus("success");
      onUpdate(); // Chama a função para recarregar os dados na página pai
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };
  
  // A lógica para encontrar o nome do lab agora usa a prop `device`
  const selectedLabName = device.lab?.name || "Nenhum";

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-black/5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold md:text-lg">{device.location || `Dispositivo #${device.id}`}</h2>
        <p className="text-xs md:text-sm text-gray-600">MAC: {device.macAddress}</p>
        <p className="text-xs md:text-sm text-gray-600">IP: {device.ipAddress || "Não registrado"}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <Listbox value={selectedLabId} onChange={setSelectedLabId}>
          <div className="relative w-full sm:w-48">
            <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-gray-50 p-3 text-left text-gray-800 font-semibold border border-gray-200 shadow-sm">
              <span className="truncate flex items-center gap-2">
                <LuHotel /> {allLabs.find(lab => lab.id === selectedLabId)?.name || "Nenhum"}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronsDown className="h-4 w-4 text-gray-600" />
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black p-2 text-sm shadow-lg ring-1 ring-black/5 z-10">
              <ListboxOption value={null} className="cursor-pointer select-none p-2 rounded hover:bg-gray-100">
                Nenhum
              </ListboxOption>
              {allLabs.map((lab) => (
                <ListboxOption key={lab.id} value={lab.id} className="cursor-pointer select-none p-2 rounded hover:bg-gray-100">
                  {lab.name}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        
        <button 
          onClick={handleSave} 
          disabled={loading || selectedLabId === device.lab?.id} // Desabilita se não houver mudança
          className="p-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        {status === 'success' && <p className="text-xs text-green-600">Salvo!</p>}
        {status === 'error' && <p className="text-xs text-red-600">Erro!</p>}
      </div>
    </div>
  );
}