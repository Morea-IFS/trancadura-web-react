import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { useEffect, useState } from "react";
import axios from "axios";

export default function HistoryCard() {
  const [usuario, setUsuario] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/users/me", { withCredentials: true })
      .then((res) => setUsuario(res.data.username || res.data.email))
      .catch(() => setUsuario(null));
  }, []);

  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-4 p-3 bg-white rounded-lg shadow-md border border-gray-200">
        <IoCheckmarkDoneCircle className="text-secondary w-12 h-12 sm:w-16 sm:h-16" />
        <div className="flex flex-col gap-2 items-start">
          <h2 className="text-sm sm:text-lg">Mensagem</h2>
          <div className="text-gray-600 text-xs sm:text-sm flex items-center justify-center gap-1">
            <p>{usuario ? usuario : "Usuário"} •</p>
            <p>Data, hora</p>
          </div>
        </div>
        <div className="flex flex-1 justify-end">
          <p className="text-xs sm:text-sm rounded-xl bg-green-200 p-2 text-green-700 font-bold">
            Mensagem
          </p>
        </div>
      </div>
    </div>
  );
}
