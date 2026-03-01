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
  onUpdate: () => void;
}

export default function DeviceCard({
  device,
  allLabs,
  onUpdate,
}: DeviceCardProps) {
  const [selectedLabId, setSelectedLabId] = useState<number | null>(
    device.lab?.id ?? null
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setSelectedLabId(device.lab?.id ?? null);
  }, [device]);

  const handleSave = async () => {
    setLoading(true);
    setStatus("idle");

    const initiallyLinkedLabId = device.lab?.id;

    try {
      if (initiallyLinkedLabId && selectedLabId === null) {
        await api.patch(`/labs/${initiallyLinkedLabId}`, { deviceId: null });
      } else if (selectedLabId && selectedLabId !== initiallyLinkedLabId) {
        await api.patch(`/labs/${selectedLabId}`, {
          deviceId: device.id,
        });
      }

      setStatus("success");
      onUpdate();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const selectedLabName =
    allLabs.find((lab) => lab.id === selectedLabId)?.name || "Nenhum";

  return (
    <div className="w-full flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-100">
      {/* Info do dispositivo */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm md:text-lg font-bold">
          {device.location || `Dispositivo #${device.id}`}
        </h2>
        <p className="text-xs text-gray-600">MAC: {device.macAddress}</p>
        <p className="text-xs text-gray-600">
          IP: {device.ipAddress || "Não registrado"}
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        {/* Select Lab */}
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <LuHotel className="w-4 h-4 text-blue-400" />
            <label className="text-sm font-medium">Laboratório</label>
          </div>

          <Listbox value={selectedLabId} onChange={setSelectedLabId}>
            <div className="relative">
              <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white p-2 text-left text-gray-800 text-sm border border-gray-300 shadow-sm flex justify-between items-center h-[38px]">
                <span className="block truncate">{selectedLabName}</span>
                <FiChevronsDown className="h-4 w-4 text-gray-600" />
              </ListboxButton>

              <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-1 text-sm shadow-lg ring-1 ring-black/5">
                <ListboxOption
                  value={null}
                  className="cursor-pointer p-2 hover:bg-gray-100 text-gray-500 italic"
                >
                  Nenhum
                </ListboxOption>

                {allLabs.map((lab) => (
                  <ListboxOption
                    key={lab.id}
                    value={lab.id}
                    className={({ selected }) =>
                      `cursor-pointer p-2 rounded ${
                        selected ? "bg-teal-200 font-bold" : "hover:bg-gray-100"
                      }`
                    }
                  >
                    {lab.name}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={loading || selectedLabId === device.lab?.id}
          className="px-4 h-[38px] bg-blue-600 text-white text-sm font-bold rounded-md shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>

        {/* Status */}
        <div className="min-w-[60px] flex items-center">
          {status === "success" && (
            <span className="text-xs text-green-600 font-semibold">Salvo!</span>
          )}
          {status === "error" && (
            <span className="text-xs text-red-600 font-semibold">Erro!</span>
          )}
        </div>
      </div>
    </div>
  );
}
