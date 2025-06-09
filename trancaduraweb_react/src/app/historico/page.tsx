"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import HistoryCard from "@/components/HistoryCard";

import { FaRegClock } from "react-icons/fa6";
import Select from "react-select";

const opcoes = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

export default function HistoricoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                  className="w-16 sm:w-30"
                />
              </div>
            </div>
            <HistoryCard />
          </div>
        </div>
      </section>
    </div>
  );
}
