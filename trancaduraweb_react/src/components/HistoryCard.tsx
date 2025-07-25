// Import dos icones
import { CiCircleCheck } from "react-icons/ci";
import { IoCloseCircleOutline } from "react-icons/io5";

export default function HistoryCard({ acesso }: { acesso: any }) {
  const nome = acesso.nomeLab || "Lab";
  const data = new Date(acesso.date).toLocaleString();
  const status = acesso.permission ? "Autorizado" : "Negado";

  return (
    <div className="w-full flex items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-black/5 transition-transform duration-300 hover:scale-105 md:hover:scale-101">
      {acesso.permission ? (
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-green-500 to-lime-300 rounded-full">
          <CiCircleCheck className="w-6 h-6 text-white stroke-[2]" />
        </div>
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-red-700 to-rose-300 rounded-full">
          <IoCloseCircleOutline className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="flex flex-col gap-2 items-start">
        <h2 className="text-sm font-bold md:text-lg">Acesso registrado</h2>
        <div className="text-xs md:text-sm flex items-center justify-center gap-1">
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
  );
}
