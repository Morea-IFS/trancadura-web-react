import HistoryCard from "@/components/HistoryCard";
import Header from "@/components/Header";

import { FaRegClock } from "react-icons/fa6";

export default function Home() {
  return (
    <div>
      <header>
        <Header />
      </header>
      <section>
        <div>
          <h1 className="text-4xl flex items-center justify-center font-bold">Bem-vindo, Administrador</h1>
          <h3 className="text-3x1 text-gray-700 flex items-center justify-center">Use o botão abaixo para controlar a tranca</h3>
          <div className="w-80 bg-white rounded-xl p-6 shadow-md mx-auto mt-12 text-center">
            <button className="w-40 h-40 bg-black rounded-full mx-auto flex items-center justify-center text-white text-lg font-semibold">
              Abrir Tranca
            </button>
            <p className="mt-6 text-gray-600 text-sm">
              Toque no botão para abrir a tranca
            </p>
            <p className="text-gray-500 text-sm">
               A operação será registrada no histórico
            </p>
          </div>
          <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex gap-2 items-center">
              <FaRegClock className="w-6 h-6 text-foreground font-bold" />
              <p className="text-2xl font-bold">Operações Recentes</p>
            </div>
            <div className="text-gray-600 text-lg">
              <p>Suas últimas operações</p>
            </div>
            <HistoryCard />
          </div>
        </div>
      </section>
    </div>
  );
}
