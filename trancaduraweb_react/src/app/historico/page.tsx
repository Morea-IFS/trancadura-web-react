"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HistoryCard from "@/components/HistoryCard";
import { FaRegClock } from "react-icons/fa6";
import Select from "react-select";
import api from "@/lib/api";
import dayjs from "dayjs";

const opcoes = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

export default function HistoricoPage() {
  const [mounted, setMounted] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [acessos, setAcessos] = useState<any[]>([]);
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [nomeLabSelecionado, setNomeLabSelecionado] = useState<string | null>(
    null
  );
  const [filtro, setFiltro] = useState("dia");

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

  useEffect(() => {
    if (!usuarioId || !labSelecionado) return;
    api
      .get(`/devices/${labSelecionado}/all`)
      .then((res) => {
        // Filtra por usuário
        let filtrados = res.data.filter(
          (item: any) => item.userId === usuarioId
        );

        // Filtra por período
        const agora = dayjs();
        filtrados = filtrados.filter((item: any) => {
          const data = dayjs(item.date);
          if (filtro === "dia") return data.isSame(agora, "day");
          if (filtro === "semana") return data.isSame(agora, "week");
          if (filtro === "mes") return data.isSame(agora, "month");
          if (filtro === "ano") return data.isSame(agora, "year");
          return true;
        });

        filtrados = filtrados.map((item: any) => ({
          ...item,
          nomeLab: nomeLabSelecionado,
        }));
        setAcessos(filtrados);
      })
      .catch((err) => {
        console.error("Erro ao buscar acessos:", err);
        setAcessos([]);
      });
  }, [usuarioId, labSelecionado, nomeLabSelecionado, filtro]); // <-- inclua filtro aqui

  useEffect(() => {
    if (!labSelecionado) return;
    api.get(`/labs/${labSelecionado}`).then((res) => {
      setNomeLabSelecionado(res.data.name); // ou res.data.nome, conforme o backend
    });
  }, [labSelecionado]);

  if (!mounted) return null;

  return (
    <div>
      <header>
        <Header
          labSelecionado={labSelecionado}
          setLabSelecionado={setLabSelecionado}
        />
      </header>
      <section className="p-4 md:w-[70%] mx-auto">
        <div>
          <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="flex gap-2 items-center">
                  <FaRegClock className="w-4 h-4 sm:w-6 sm:h-6 text-foreground font-bold" />
                  <p className="text-lg sm:text-2xl font-bold">
                    Histórico de Operações
                  </p>
                </div>
                <div className="text-gray-600 text-base sm:text-lg">
                  <p>Todas as operações registradas</p>
                </div>
              </div>
              <div>
                <Select
                  options={opcoes}
                  placeholder="FILTRAR"
                  className="w-32"
                  value={opcoes.find((op) => op.value === filtro)}
                  onChange={(op) => setFiltro(op?.value || "dia")}
                />
              </div>
            </div>

            {acessos.length > 0 ? (
              acessos.map((item) => <HistoryCard key={item.id} acesso={item} />)
            ) : (
              <p className="text-gray-500 text-sm mt-4">
                Nenhum acesso encontrado.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
