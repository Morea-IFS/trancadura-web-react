"use client";

import { useEffect, useState } from "react";
import HistoryCard from "@/components/HistoryCard";
import Header from "@/components/Header";
import axios from "axios";
import { FaRegClock } from "react-icons/fa6";
import { IoLockClosedOutline } from "react-icons/io5";

export default function Home() {
  const [usuario, setUsuario] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/users/me", { withCredentials: true })
      .then((res) => setUsuario(res.data.username || res.data.email))
      .catch(() => setUsuario(null));
  }, []);

  return (
    <div>
      <header>
        <Header />
      </header>
      <section className="p-4">
        <div className="w-full mx-auto max-w-4xl p-4 flex items-center justify-center flex-col gap-1">
          <h1 className="font-bold text-2xl sm:text-4xl">
            Bem vindo, {usuario ? usuario : "usuário"}
          </h1>
          <p className="font-bold text-base sm:text-lg text-gray-600">
            Use o botão abaixo para controlar a tranca
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col gap-4 items-center justify-center w-88  p-12 bg-white rounded-lg shadow-md border border-gray-200">
            <button className="cursor-pointer bg-foreground text-white p-8 rounded-full flex flex-col gap-4 items-center justify-center transition duration-200 hover:scale-105 active:scale-105">
              <IoLockClosedOutline className="w-16 h-16" />
              <span className="inline text-xl font-bold">Abrir tranca</span>
            </button>

            <div className="text-gray-600 text-sm  w-full text-center">
              <p>
                Toque no botão para abrir a tranca <br /> A opreção será
                resgistrada no histórico
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="p-4 md:w-[70%] mx-auto">
        <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex gap-2 items-center">
            <FaRegClock className="w-4 h-4 sm:w-6 sm:h-6 text-foreground font-bold" />
            <p className="text-lg sm:text-2xl font-bold">Operações Recentes</p>
          </div>
          <div className="text-gray-600 text-base sm:text-lg">
            <p>Suas últimas operações</p>
          </div>
          <HistoryCard />
        </div>
      </section>
    </div>
  );
}
