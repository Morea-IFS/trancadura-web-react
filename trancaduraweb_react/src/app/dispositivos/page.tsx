"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import DeviceCard from "@/components/DeviceCard";
import api from "@/lib/api";

export default function DispositivosPage() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transforma a busca de dados em uma função que pode ser chamada novamente
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [devicesRes, labsRes] = await Promise.all([
        api.get('/devices'),
        api.get('/labs')
      ]);
      setDevices(devicesRes.data);
      setLabs(labsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <Header
        labSelecionado={labSelecionado}
        setLabSelecionado={setLabSelecionado}
      />

      <section className="p-4 md:w-[70%] mx-auto flex flex-col gap-6">
        <h1 className="font-bold text-2xl md:text-4xl text-center">
          Gerenciamento de{" "}
          <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">
            Dispositivos
          </span>
        </h1>

        {loading ? (
          <p>Carregando dispositivos...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {devices.length > 0 ? (
              devices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  allLabs={labs} 
                  onUpdate={fetchData}
                />
              ))
            ) : (
              <p>Nenhum dispositivo encontrado.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}