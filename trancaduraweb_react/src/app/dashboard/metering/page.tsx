"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import MeteringChart from "@/components/MeteringChart";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { FiChevronsDown, FiActivity, FiZap, FiDroplet, FiRefreshCw } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

interface Device {
  id: number;
  name: string;
  type: string;
  location: string;
}

interface ChartDataStats {
  current: number;
  max: number;
  total: number;
}

interface ChartDataSeries {
  labels: string[];
  values: number[];
  stats: ChartDataStats;
}

interface ChartApiResponse {
  [key: string]: ChartDataSeries;
}

export default function MeteringDashboard() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await api.get("/devices");
        const meteringDevices = res.data.filter((d: any) => d.type !== "ACCESS_CONTROL");
        setDevices(meteringDevices);
        
        if (meteringDevices.length > 0) {
          setSelectedDeviceId(meteringDevices[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar dispositivos:", error);
      }
    }
    fetchDevices();
  }, []);

  const fetchChartData = useCallback(async (deviceId: number) => {
    try {
      const res = await api.get(`/metering/${deviceId}/chart`);
      setChartData(res.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    setLoading(true);
    fetchChartData(selectedDeviceId);

    const interval = setInterval(() => {
      fetchChartData(selectedDeviceId);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDeviceId, fetchChartData]);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  const getIconForType = (type: string) => {
    if (type === "WATER_METER") return <FiDroplet className="w-6 h-6 text-blue-500" />;
    if (type === "ENERGY_METER") return <FiZap className="w-6 h-6 text-yellow-500" />;
    return <FiActivity className="w-6 h-6 text-gray-500" />;
  };

  const getColorForLabel = (label: string) => {
    if (label.includes("Volume")) return "#3b82f6";
    if (label.includes("kWh")) return "#f59e0b";
    if (label.includes("Ampere")) return "#ef4444";
    return "#10b981";
  };

  // Função auxiliar para formatar a data da última leitura
  const getLastReadingDate = (labels: string[]) => {
    if (!labels || labels.length === 0) return "--";
    const lastDate = new Date(labels[labels.length - 1]);
    return lastDate.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header labSelecionado={labSelecionado} setLabSelecionado={setLabSelecionado} />

      <main className="p-4 md:px-20 py-8 max-w-7xl mx-auto flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Monitoramento <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Sparc</span>
            </h1>
            <p className="text-gray-500 text-sm">Acompanhamento em tempo real de recursos hídricos e energéticos.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <FiRefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            Atualizado: {lastUpdate?.toLocaleTimeString() || "--:--"}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-blue-50 rounded-full border border-blue-100">
            {selectedDevice ? getIconForType(selectedDevice.type) : <FiActivity className="w-6 h-6" />}
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Dispositivo Selecionado
            </label>
            <Listbox value={selectedDeviceId} onChange={setSelectedDeviceId}>
              <div className="relative">
                <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm">
                  <span className="block truncate font-bold text-gray-700">
                    {selectedDevice ? `${selectedDevice.name} - ${selectedDevice.location || 'Sem local'}` : "Selecione um dispositivo..."}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <FiChevronsDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {devices.map((device) => (
                    <ListboxOption
                      key={device.id}
                      value={device.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                          active ? "bg-blue-50 text-blue-700" : "text-gray-900"
                        }`
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{device.name}</span>
                        <span className="text-xs text-gray-500">{device.location}</span>
                      </div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
        </div>

        {chartData && Object.keys(chartData).length > 0 ? (
          <div className="flex flex-col gap-10">
            {Object.entries(chartData).map(([label, data]) => (
              <div key={label} className="animate-fade-in space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* CARD CONSUMO ATUAL - Com a Data e Hora */}
                  <StatCard 
                    label="Consumo Atual" 
                    value={data.stats.current} 
                    unit={label.split('(')[1]?.replace(')', '')} 
                    color="border-l-blue-500"
                    detail={`Medido em: ${getLastReadingDate(data.labels)}`} 
                  />

                  <StatCard 
                    label="Pico (24h)" 
                    value={data.stats.max} 
                    unit={label.split('(')[1]?.replace(')', '')} 
                    color="border-l-yellow-500" 
                  />
                  <StatCard 
                    label="Total Acumulado" 
                    value={data.stats.total} 
                    unit={label.split('(')[1]?.replace(')', '')} 
                    color="border-l-green-500" 
                  />
                </div>

                <MeteringChart 
                  title={`Histórico de ${label}`} 
                  data={data.values} 
                  labels={data.labels} 
                  unit={label.split('(')[1]?.replace(')', '') || ''}
                  color={getColorForLabel(label)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
            <FiActivity className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhum dado disponível</p>
            <p className="text-sm">Selecione um dispositivo ou aguarde a coleta de dados.</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente StatCard atualizado para aceitar 'detail'
function StatCard({ label, value, unit, color, detail }: { label: string, value: number, unit: string, color: string, detail?: string }) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${color} border-y border-r border-gray-100 flex flex-col justify-between`}>
      <div>
        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <span className="text-sm font-medium text-gray-400">{unit}</span>
        </div>
      </div>
      {/* Exibe o detalhe (data/hora) se existir */}
      {detail && (
        <p className="text-[10px] text-gray-400 mt-2 border-t border-gray-50 pt-1">
          {detail}
        </p>
      )}
    </div>
  );
}