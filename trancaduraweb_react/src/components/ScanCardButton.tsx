// src/components/ScanCardButton.tsx
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
import { FaRegIdCard } from "react-icons/fa";

interface Device {
  id: number;
  location: string;
}

interface ScanCardButtonProps {
  userId: number | null;
}

export default function ScanCardButton({ userId }: ScanCardButtonProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "scanning" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get("/devices");
        setDevices(res.data);
        if (res.data.length > 0) {
          setSelectedDeviceId(res.data[0].id);
        }
      } catch (err) {
        setMessage("Falha ao carregar os leitores.");
        setStatus("error");
      }
    };
    fetchDevices();
  }, []);

  const handleScan = async () => {
    if (!selectedDeviceId || !userId) {
      setMessage("Selecione um leitor e certifique-se de estar logado.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await api.post(`/devices/${selectedDeviceId}/hexid`, { userId });
      const { deviceIp, apiToken } = res.data;

      if (!deviceIp || !apiToken) {
        throw new Error("Dispositivo não configurado para escaneamento.");
      }

      setStatus("scanning");
      setMessage("Aproxime o novo cartão do leitor...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      await fetch(`http://${deviceIp}/hexid?apiToken=${apiToken}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      setStatus("success");
      setMessage("Cartão escaneado com sucesso! Agora ele pode ser vinculado a um usuário.");

    } catch (err: any) {
      console.error("Erro durante o escaneamento:", err);
      setStatus("error");
      if (err.name === 'AbortError') {
        setMessage("Tempo esgotado. Nenhuma cartão foi aproximado.");
      } else {
        setMessage(err.response?.data?.message || "Falha na comunicação com o leitor.");
      }
    }
  };

  const getSelectedDeviceName = () => {
    if (selectedDeviceId === null) {
      return "Selecione um leitor";
    }
    const device = devices.find((d) => d.id === selectedDeviceId);
    if (!device) {
      return "Selecione um leitor";
    }
    return device.location || `Dispositivo ${device.id}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-bold text-sm">Leitor a ser utilizado:</p>
      <Listbox value={selectedDeviceId} onChange={setSelectedDeviceId}>
        <div className="relative w-full">
          <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white p-3 text-left text-gray-800 font-semibold border border-gray-200 shadow-sm">
            {getSelectedDeviceName()}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronsDown className="h-4 w-4 text-gray-600" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black p-2 text-sm shadow-lg ring-1 ring-black/5 z-50">
            {devices.map((device) => (
              <ListboxOption
                key={device.id}
                value={device.id}
                className="cursor-pointer select-none p-2 m-1 rounded hover:bg-gray-100"
              >
                {device.location || `Dispositivo ${device.id}`}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      <button
        onClick={handleScan}
        disabled={status === "loading" || status === "scanning"}
        className="w-full flex items-center justify-center gap-2 p-3 mt-2 font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg shadow-md transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaRegIdCard />
        {status === "loading" && "Iniciando..."}
        {status === "scanning" && "Aguardando cartão..."}
        {(status === "idle" || status === "success" || status === "error") &&
          "Escanear Novo Cartão"}
      </button>

      {message && (
        <p
          className={`text-sm text-center mt-2 font-semibold ${
            status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}