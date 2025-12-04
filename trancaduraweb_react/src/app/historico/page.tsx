"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HistoryCard from "@/components/HistoryCard";
import api from "@/lib/api";
import dayjs from "dayjs";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

// Import dos icones
import { FaRegClock } from "react-icons/fa6";
import { SlGraph } from "react-icons/sl";
import { CiDiscount1 } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { LuTriangleAlert } from "react-icons/lu";
import { RiFilter2Line } from "react-icons/ri";
import { FiChevronsDown } from "react-icons/fi";

// Configuração para os filtros / utilizei o dayjs para manipulação de datas
type Periodo = "dia" | "semana" | "mes" | "ano";
type StatusFiltro = "autorizado" | "nao-autorizado" | null;

const periodOptions: { value: Periodo; label: string }[] = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

const statusOptions: { value: Exclude<StatusFiltro, null>; label: string }[] = [
  { value: "autorizado", label: "Autorizado" },
  { value: "nao-autorizado", label: "Não autorizado" },
];

export default function HistoricoPage() {
  const [mounted, setMounted] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [acessos, setAcessos] = useState<any[]>([]);
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [nomeLabSelecionado, setNomeLabSelecionado] = useState<string | null>(
    null
  );
  const [filtroPeriodo, setFiltroPeriodo] = useState<Periodo>("dia");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>(null);

  // Buscar o usuário logado e os acessos
  useEffect(() => {
    setMounted(true);

    api
      .get("/users/me")
      .then((res) => {
        setUsuarioId(res.data.userId);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuário:", err);
      });
  }, []);

  // Buscar os acessos do usuário selecionado
  useEffect(() => {
    if (!labSelecionado) return;

    api.get(`/labs/${labSelecionado}`).then((resLab) => {
       const lab = resLab.data;
       setNomeLabSelecionado(lab.name);
       
       const deviceId = lab.deviceId || lab.device?.id;

       if (!deviceId) {
         console.warn("Este laboratório não possui dispositivo vinculado.");
         setAcessos([]);
         return;
       }

       api.get(`/devices/${deviceId}/all`)
        .then((res) => {
          console.log(`Acessos encontrados para Device ${deviceId}:`, res.data.length);
          let filtrados = res.data;

          // Filtra por período
          const agora = dayjs();
          filtrados = filtrados.filter((item: any) => {
            const dataAcesso = dayjs(item.date);
            if (filtroPeriodo === "dia") return dataAcesso.isSame(agora, "day");
            if (filtroPeriodo === "semana") return dataAcesso.isSame(agora, "week");
            if (filtroPeriodo === "mes") return dataAcesso.isSame(agora, "month");
            if (filtroPeriodo === "ano") return dataAcesso.isSame(agora, "year");
            return true;
          });

          // Filtra por status
          if (statusFiltro === "autorizado") {
            filtrados = filtrados.filter((item: any) => item.permission === true);
          } else if (statusFiltro === "nao-autorizado") {
            filtrados = filtrados.filter((item: any) => item.permission === false);
          }

          filtrados = filtrados.map((item: any) => ({
            ...item,
            nomeLab: lab.name,
          }));

          setAcessos(filtrados);
        })
        .catch((err) => {
          console.error("Erro ao buscar acessos:", err);
          setAcessos([]);
        });
    });

  }, [
    labSelecionado,
    filtroPeriodo,
    statusFiltro,
  ]);

  // Buscar o nome do laboratório selecionado
  useEffect(() => {
    if (!labSelecionado) return;
    api.get(`/labs/${labSelecionado}`).then((res) => {
      setNomeLabSelecionado(res.data.name);
    });
  }, [labSelecionado]);

  if (!mounted) return null;

  const total = acessos.length;

  const periodoLabel =
    periodOptions.find((p) => p.value === filtroPeriodo)?.label ?? "Período";

  const statusLabel =
    statusFiltro === null
      ? "Status"
      : statusFiltro === "autorizado"
      ? "Autorizado"
      : "Não autorizado";

  return (
    <div>
      <header>
        <Header
          labSelecionado={labSelecionado}
          setLabSelecionado={setLabSelecionado}
        />
      </header>

      <section className="p-4 md:px-40 md:mt-15 gap-6 flex flex-col items-center justify-center mx-auto">
        {/* Título */}
        <div className="w-full text-center flex flex-col items-center gap-2">
          <h1 className="font-bold text-2xl md:text-4xl">
            Registro de{" "}
            <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">
              Atividades
            </span>
          </h1>
          <p className="text-sm md:text-lg">
            Monitore todas as operações realizadas no laboratório
          </p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full font-bold">
          {/* Total */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-fuchsia-300 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Total</div>
              <div className="text-2xl md:text-3xl font-bold">
                {acessos.length > 0 ? `${acessos.length}` : "0"}
              </div>
            </div>
            <SlGraph className="w-12 h-12" />
          </div>

          {/* Sucesso */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-lime-300 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Sucesso</div>
              <div className="text-2xl md:text-3xl font-bold">
                {acessos.filter((a) => a.permission === true).length}
              </div>
            </div>
            <CiCircleCheck className="w-12 h-12" />
          </div>

          {/* Porcentagem */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Porcentagem</div>
              <div className="text-2xl md:text-3xl font-bold">
                {acessos.length > 0
                  ? `${Math.round(
                      (acessos.filter((a) => a.permission === true).length /
                        acessos.length) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <CiDiscount1 className="w-12 h-12" />
          </div>

          {/* Falhas */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-red-400 rounded-lg shadow-md h-24">
            <div className="flex flex-col justify-center">
              <div className="text-sm md:text-base">Falhas</div>
              <div className="text-2xl md:text-3xl font-bold">
                {acessos.filter((a) => a.permission === false).length}
              </div>
            </div>
            <LuTriangleAlert className="w-12 h-12" />
          </div>
        </div>

        {/* Filtros */}
        <div className="p-4 w-full flex flex-col gap-4 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-violet-500 to-fuchsia-300 text-white font-bold rounded-md flex items-center justify-center">
              <RiFilter2Line className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <p className="text-lg font-bold md:text-2xl">Filtros</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Período */}
            <div className="w-full">
              <Listbox value={filtroPeriodo} onChange={setFiltroPeriodo}>
                <div className="relative w-full">
                  <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white p-3 text-left text-gray-800 font-semibold border border-gray-200 shadow-sm">
                    {periodoLabel}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FiChevronsDown className="h-4 w-4 text-gray-600" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black p-2 text-sm md:text-base shadow-lg ring-1 ring-black/5 z-50">
                    {periodOptions.map((opt) => (
                      <ListboxOption
                        key={opt.value}
                        value={opt.value}
                        className={({ selected }) =>
                          `relative cursor-pointer select-none p-2 m-1 rounded ${
                            selected
                              ? "bg-teal-200 font-bold"
                              : "bg-white hover:bg-gray-100"
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

            {/* Status */}
            <div className="w-full">
              <Listbox value={statusFiltro} onChange={setStatusFiltro}>
                <div className="relative w-full">
                  <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white p-3 text-left text-gray-800 font-semibold border border-gray-200 shadow-sm">
                    {statusLabel}
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <FiChevronsDown className="h-4 w-4 text-gray-600" />
                    </span>
                  </ListboxButton>
                  <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black p-2 text-sm md:text-base shadow-lg ring-1 ring-black/5 z-50">
                    <ListboxOption
                      value={null}
                      className={({ selected }) =>
                        `relative cursor-pointer select-none p-2 m-1 rounded ${
                          selected
                            ? "bg-teal-200 font-bold"
                            : "bg-white hover:bg-gray-100"
                        }`
                      }
                    >
                      Todos
                    </ListboxOption>
                    {statusOptions.map((opt) => (
                      <ListboxOption
                        key={opt.value}
                        value={opt.value}
                        className={({ selected }) =>
                          `relative cursor-pointer select-none p-2 m-1 rounded ${
                            selected
                              ? "bg-teal-100 font-bold"
                              : "bg-white hover:bg-gray-100"
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
          </div>
        </div>

        {/* Operações Recentes */}
        <div className="p-4 w-full flex flex-col gap-2 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-violet-500 to-fuchsia-300 text-white font-bold rounded-md flex items-center justify-center">
              <FaRegClock className="w-4 h-4 md:w-6 md:h-6 stroke-[2]" />
            </div>
            <p className="text-lg font-bold md:text-2xl">
              Registro de Operações
            </p>
          </div>
          <div className="text-sm md:text-lg">
            <p>
              {total} operação{total === 1 ? "" : "es"} registrada
              {total === 1 ? "" : "s"} no período selecionado
            </p>
          </div>
          {acessos.length > 0 ? (
            acessos.map((item) => <HistoryCard key={item.id} acesso={item} />)
          ) : (
            <p className="text-sm mt-4">Nenhum acesso encontrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
