import { IoCheckmarkDoneCircle, IoCloseCircle } from "react-icons/io5";

export default function HistoryCard({ acesso }: { acesso: any }) {
  const nome = acesso.nomeLab || "Lab";
  const data = new Date(acesso.date).toLocaleString();
  const status = acesso.permission ? "Autorizado" : "Negado";

  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        {acesso.permission ? (
          <IoCheckmarkDoneCircle className="text-secondary w-12 h-12 sm:w-16 sm:h-16" />
        ) : (
          <IoCloseCircle className="text-red-600 w-12 h-12 sm:w-16 sm:h-16" />
        )}
        <div className="flex flex-col gap-2 items-start">
          <h2 className="text-sm sm:text-lg">Acesso registrado</h2>
          <div className="text-gray-600 text-xs sm:text-sm flex items-center justify-center gap-1">
            <p>{nome} •</p>
            <p>{data}</p>
          </div>
        </div>
        <div className="flex flex-1 justify-end">
          <p
            className={`text-xs sm:text-sm rounded-xl p-2 font-bold ${
              acesso.permission
                ? "bg-green-200 text-green-700"
                : "bg-red-200 text-red-700"
            }`}
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
