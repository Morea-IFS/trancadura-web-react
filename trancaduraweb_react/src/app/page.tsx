import HistoryCard from "@/components/HistoryCard";

import { FaRegClock } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="p-4">
      <div>
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
    </div>
  );
}
