"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import DeviceCard from "@/components/DeviceCard";
import CreateLabForm from "@/components/Forms/CreateLabForm";
import api from "@/lib/api";

// Icons
import { IoHardwareChip } from "react-icons/io5";
import { FaRegBuilding } from "react-icons/fa";
import { RiFilter2Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";

export default function DispLabsPage() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);

  const [devices, setDevices] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [canManage, setCanManage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tab, setTab] = useState<"devices" | "labs">("devices");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [devicesRes, labsRes, meRes] = await Promise.all([
        api.get("/devices"),
        api.get("/labs"),
        api.get("/users/me"),
      ]);

      setDevices(devicesRes.data);
      setLabs(labsRes.data);

      const roles = meRes.data.roles?.map((r: any) => r.role.name) || [];
      setCanManage(roles.includes("superuser") || roles.includes("staff"));
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveNewLab = (newLab: any) => {
    setLabs((prev) => [...prev, { ...newLab, _count: { users: 0 } }]);
  };

  // Métricas
  const dispositivosAtivos = devices.filter(
    (d) => d.status === "online"
  ).length;

  const labsAtivos = labs.filter((lab) => {
    const device = devices.find(
      (d) => d.id === lab.deviceId || d.id === lab.device?.id
    );
    return device?.status === "online";
  }).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header
        labSelecionado={labSelecionado}
        setLabSelecionado={setLabSelecionado}
      />

      <section className="p-4 md:w-[70%] mx-auto flex flex-col gap-10 py-8">
        {/* Título */}
        <div className="w-full text-center flex flex-col items-center gap-2">
          <h1 className="font-bold text-2xl md:text-4xl">
            Gerenciamento de{" "}
            <span className="bg-gradient-to-r from-blue-800 to-teal-500 text-transparent bg-clip-text">
              Dispositivos & Laboratórios
            </span>
          </h1>
          <p className="text-sm md:text-lg">
            Configure dispositivos, cadastre novos laboratórios e monitore o
            ecossistema MOREA.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTab("devices")}
            className={`px-6 py-3 rounded-lg font-semibold shadow-md transition ${
              tab === "devices"
                ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white scale-105"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Dispositivos
          </button>

          <button
            onClick={() => setTab("labs")}
            className={`px-6 py-3 rounded-lg font-semibold shadow-md transition ${
              tab === "labs"
                ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white scale-105"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            Laboratórios
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full font-bold">
          {/* Total Devices */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-teal-300 rounded-lg shadow-md text-white flex justify-between items-center h-24">
            <div>
              <p className="text-sm md:text-base">Dispositivos</p>
              <p className="text-2xl md:text-3xl">{devices.length}</p>
            </div>
            <IoHardwareChip className="w-12 h-12" />
          </div>

          {/* Total Labs */}
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-300 rounded-lg shadow-md text-white flex justify-between items-center h-24">
            <div>
              <p className="text-sm md:text-base">Laboratórios</p>
              <p className="text-2xl md:text-3xl">{labs.length}</p>
            </div>
            <FaRegBuilding className="w-12 h-12" />
          </div>

          {/* Dispositivos Ativos */}
          <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-300 rounded-lg shadow-md text-white flex justify-between items-center h-24">
            <div>
              <p className="text-sm md:text-base">Dispositivos Ativos</p>
              <p className="text-2xl md:text-3xl">{dispositivosAtivos}</p>
            </div>
            <RiFilter2Line className="w-12 h-12" />
          </div>

          {/* Labs Ativos */}
          <div className="p-4 bg-gradient-to-r from-rose-500 to-red-300 rounded-lg shadow-md text-white flex justify-between items-center h-24">
            <div>
              <p className="text-sm md:text-base">Laboratórios Ativos</p>
              <p className="text-2xl md:text-3xl">{labsAtivos}</p>
            </div>
            <RiFilter2Line className="w-12 h-12" />
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="bg-white p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] flex flex-col gap-6">
          {/* DISPOSITIVOS */}
          {tab === "devices" && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <IoHardwareChip className="text-blue-600" />
                Lista de Dispositivos
              </h2>

              {!loading ? (
                devices.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {devices.map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        allLabs={labs}
                        onUpdate={fetchData}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Nenhum dispositivo encontrado.
                  </p>
                )
              ) : (
                <p>Carregando...</p>
              )}
            </>
          )}

          {/* LABORATÓRIOS */}
          {tab === "labs" && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <FaRegBuilding className="text-teal-600" />
                  Laboratórios Cadastrados
                </h2>

                {canManage && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-3 bg-gradient-to-r from-green-500 to-lime-400 text-white font-bold rounded-lg shadow-md flex items-center gap-2 hover:scale-105 transition"
                  >
                    <FaPlus /> Novo Lab
                  </button>
                )}
              </div>

              {!loading ? (
                labs.length > 0 ? (
                  <div className="flex flex-col divide-y divide-gray-200">
                    {labs.map((lab) => (
                      <div
                        key={lab.id}
                        className="py-4 flex justify-between items-center"
                      >
                        <span className="font-semibold">{lab.name}</span>

                        <span className="text-gray-600 text-sm">
                          {lab._count?.users ?? 0} membro(s)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Nenhum laboratório encontrado.
                  </p>
                )
              ) : (
                <p>Carregando...</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* MODAL DE LAB */}
      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 w-80 sm:w-full max-w-md relative">
            <div className="overflow-y-auto max-h-[90vh] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-4xl"
                aria-label="Fechar"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-center mb-6">
                Adicionar Novo Laboratório
              </h2>

              <CreateLabForm
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNewLab}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
