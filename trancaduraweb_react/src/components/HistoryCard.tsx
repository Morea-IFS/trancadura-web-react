import { IoCheckmarkDoneCircle } from "react-icons/io5";

export default function HistoryCard() {
  return (
    <div className="w-full p-2">
      <div className="w-full flex items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        <IoCheckmarkDoneCircle className="text-secondary w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
        <div className="flex flex-col gap-2 items-start">
          <h2 className="text-sm sm:text-lg md:text-xl">Mensagem</h2>
          <div className="text-gray-600 text-xs sm:text-sm md:text-lg flex items-center justify-center gap-1">
            <p>Usuário •</p>
            <p>Data, hora</p>
          </div>
        </div>
        <div className="flex flex-1 justify-end">
          <p className="text-xs sm:text-sm md:text-lg rounded-xl bg-green-200 p-2 text-green-700 font-bold">
            Mensagem
          </p>
        </div>
      </div>
    </div>
  );
}
