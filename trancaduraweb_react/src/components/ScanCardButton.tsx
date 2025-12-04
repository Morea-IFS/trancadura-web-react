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
import { FaRegIdCard, FaSpinner } from "react-icons/fa";

interface Device {
  id: number;
  location: string;
}

interface ScanCardButtonProps {
  userId: number | null;
  onSuccess?: () => void;
}

export default function ScanCardButton({ userId, onSuccess }: ScanCardButtonProps) {
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
    setMessage("Conectando ao dispositivo...");

    try {
      // 1. Snapshot: Pega a quantidade atual de cartões
      const initialCardsRes = await api.get(`/users/${userId}/cards`);
      const initialCount = initialCardsRes.data.length;

      // 2. Prepara dados do ESP32
      const res = await api.post(`/devices/${selectedDeviceId}/hexid`, { userId });
      const { deviceIp, apiToken } = res.data;

      if (!deviceIp || !apiToken) {
        throw new Error("Dispositivo não configurado ou IP desconhecido.");
      }

      // 3. Tenta disparar o comando no ESP32
      // TRUQUE: Envolvemos isso num try/catch isolado.
      // Se o navegador bloquear a resposta (CORS/Network Error), a gente ignora e segue para o polling.
      try {
        await fetch(`http://${deviceIp}/hexid?apiToken=${apiToken}&userId=${userId}`, {
          method: 'GET',
          mode: 'no-cors', // Tenta forçar o envio mesmo sem esperar resposta limpa
        });
      } catch (fetchErr) {
        console.warn("Aviso: O navegador bloqueou a resposta do ESP32, mas o comando provavelmente chegou. Iniciando verificação...");
      }

      // 4. Entra no modo de espera (Polling) imediatamente
      setStatus("scanning");
      setMessage("Aproxime o cartão do leitor agora...");

      let attempts = 0;
      const maxAttempts = 15; // 30 segundos (15 * 2s)
      let cardDetected = false;

      while (attempts < maxAttempts) {
        // Espera 2 segundos
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Verifica se o número de cartões aumentou no Backend
        const currentCardsRes = await api.get(`/users/${userId}/cards`);
        const currentCount = currentCardsRes.data.length;

        if (currentCount > initialCount) {
          cardDetected = true;
          break; // Cartão novo detectado!
        }
        
        attempts++;
      }

      if (cardDetected) {
        setStatus("success");
        setMessage("Cartão vinculado com sucesso!");
        if (onSuccess) onSuccess();
      } else {
        setStatus("error");
        setMessage("Tempo esgotado. O cartão não foi identificado.");
      }

    } catch (err: any) {
      console.error("Erro geral no fluxo:", err);
      setStatus("error");
      setMessage(err.response?.data?.message || "Falha ao iniciar processo.");
    }
  };

  const getSelectedDeviceName = () => {
    if (selectedDeviceId === null) return "Selecione um leitor";
    const device = devices.find((d) => d.id === selectedDeviceId);
    return device ? (device.location || `Dispositivo ${device.id}`) : "Selecione um leitor";
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-bold text-sm text-gray-700">Leitor a ser utilizado:</p>
      
      <Listbox value={selectedDeviceId} onChange={setSelectedDeviceId}>
        <div className="relative w-full">
          <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white p-3 text-left text-gray-800 font-semibold border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {getSelectedDeviceName()}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FiChevronsDown className="h-5 w-5 text-gray-500" />
            </span>
          </ListboxButton>
          <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black py-1 text-sm shadow-lg ring-1 ring-black/5 z-50 focus:outline-none">
            {devices.map((device) => (
              <ListboxOption
                key={device.id}
                value={device.id}
                className={({ active }) =>
                  `cursor-pointer select-none p-2 px-4 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
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
        className={`w-full flex items-center justify-center gap-2 p-3 mt-2 font-bold text-white rounded-lg shadow-md transition-all
          ${status === "success" 
            ? "bg-green-600 hover:bg-green-700" 
            : status === "error" 
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gradient-to-r from-blue-600 to-teal-500 hover:scale-[1.02]"
          }
          disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
      >
        {status === "loading" || status === "scanning" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaRegIdCard />
        )}
        
        {status === "loading" && "Conectando..."}
        {status === "scanning" && "Aguardando Cartão..."}
        {status === "success" && "Sucesso!"}
        {status === "error" && "Tentar Novamente"}
        {status === "idle" && "Escanear Novo Cartão"}
      </button>

      {message && (
        <div className={`text-sm text-center mt-2 font-medium p-2 rounded bg-opacity-10 
          ${status === "success" ? "bg-green-500 text-green-700" : 
            status === "error" ? "bg-red-500 text-red-700" : 
            status === "scanning" ? "bg-blue-500 text-blue-700 animate-pulse" : "text-gray-600"}`
        }>
          {message}
        </div>
      )}
    </div>
  );
}