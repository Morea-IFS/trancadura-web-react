"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HistoryCard from "@/components/HistoryCard";
import { FaRegClock } from "react-icons/fa6";
import Select from "react-select";
import axios from "axios";

const opcoes = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

export default function HistoricoPage() {
  const [mounted, setMounted] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [acessos, setAcessos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    axios
      .get("http://localhost:8080/api/users/me", { withCredentials: true })
      .then((res) => {
        setUsuarioId(res.data.userId);
        setIsStaff(res.data.isStaff);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuário:", err);
      });
  }, []);

  useEffect(() => {
    if (usuarioId === null) return;

    axios
      .get("http://localhost:8080/api/devices/cmc8059ly0000ovu0j4ahbc13/all", {
        withCredentials: true,
      })
      .then((res) => {
        let dados = res.data;

        if (!isStaff) {
          dados = dados.filter((item: any) => item.userId === usuarioId);
        }

        if (filtro) {
          const agora = new Date();
          let limite: Date = new Date();

          switch (filtro) {
            case "dia":
              limite.setDate(agora.getDate() - 1);
              break;
            case "semana":
              limite.setDate(agora.getDate() - 7);
              break;
            case "mes":
              limite.setMonth(agora.getMonth() - 1);
              break;
            case "ano":
              limite.setFullYear(agora.getFullYear() - 1);
              break;
          }

          dados = dados.filter((item: any) => new Date(item.date) >= limite);
        }

        dados.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAcessos(dados);
      })
      .catch((err) => {
        console.error("Erro ao buscar acessos:", err);
        setAcessos([]);
      });
  }, [usuarioId, isStaff, filtro]);

  if (!mounted) return null;

  return (
    <div>
      <header>
        <Header />
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
                  onChange={(e) => setFiltro(e?.value ?? null)}
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
