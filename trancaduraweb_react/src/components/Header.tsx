import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

import { MdOutlineSensorDoor } from "react-icons/md";
import { IoExitOutline } from "react-icons/io5";
import { FiChevronsDown } from "react-icons/fi";
import { FaHistory } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { MdOutlineLock, MdDateRange } from "react-icons/md";
import { CiRouter } from "react-icons/ci";
import { LuHotel } from "react-icons/lu";

type HeaderProps = {
  labSelecionado: number | null;
  setLabSelecionado: (id: number) => void;
};

export default function Header({
  labSelecionado,
  setLabSelecionado,
}: HeaderProps) {
  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);

  const carregarLabs = async () => {
    try {
      const res = await api.get("/labs/me");
      console.log(res.data)
      setLabs(res.data);
      const savedLab = localStorage.getItem("labSelecionado");
      const parsedSavedLab = savedLab ? Number(savedLab) : null;

      if (
        res.data.length > 0 &&
        parsedSavedLab === null &&
        labSelecionado === null
      ) {
        setLabSelecionado(res.data[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar labs:", err);
    }
  };

  useEffect(() => {
    const savedLab = localStorage.getItem("labSelecionado");
    if (savedLab) {
      setLabSelecionado(Number(savedLab));
    }

    carregarLabs();
  }, []);

  useEffect(() => {
    if (labSelecionado !== null) {
      localStorage.setItem("labSelecionado", labSelecionado.toString());
    }
  }, [labSelecionado]);

  return (
    <header className="bg-gradient-to-r from-blue-800 to-teal-500 text-background w-full shadow-xl">
      <div className="flex flex-col p-4 gap-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
                <MdOutlineSensorDoor className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="font-bold">
                <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">
                  MOREA
                </p>
                <p className="text-sm md:text-base">Trancadura WEB</p>
              </div>
            </div>
          </Link>

          <Link
            href="/logout"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <IoExitOutline className="w-6 h-6 md:w-8 md:h-8" />
            <span className="hidden md:block text-xl font-bold">Sair</span>
          </Link>
        </div>

        {/* Select dos laboratórios */}
        <div>
          <Listbox value={labSelecionado} onChange={setLabSelecionado}>
            <div className="relative w-full">
              <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white/20 p-2 md:p-4 text-left text-white font-bold border border-white/20 shadow-md transition-transform duration-300 hover:bg-white/30 outline-none">
                {labs.find((lab) => lab.id === labSelecionado)?.name ??
                  "Selecione um lab"}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FiChevronsDown
                    className="h-6 w-6 text-white font-bold"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>

              <ListboxOptions className="text-black absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black">
                {labs.map((lab) => (
                  <ListboxOption
                    key={lab.id}
                    value={lab.id}
                    className={({ selected }) =>
                      `relative cursor-pointer select-none p-2 m-2 rounded transition-colors outline-none
         ${
           selected ? "bg-teal-300 font-bold text-black" : "bg-white text-black"
         }`
                    }
                  >
                    {({ selected }) => (
                      <span className="block truncate">{lab.name}</span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <MdOutlineLock className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Tranca</span>
          </Link>
          <Link
            href="/historico"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <FaHistory className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Histórico</span>
          </Link>
          <Link
            href="/membros"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <IoPeopleSharp className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Membros</span>
          </Link>
          <Link
            href="/dispositivos"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <CiRouter className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Dispositivos</span>
          </Link>
          <Link
            href="/laboratorios"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <LuHotel className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Labs</span>
          </Link>
          <Link
            href="/reservas"
            className="w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-120 md:hover:scale-105 hover:bg-white/30"
          >
            <MdDateRange className="w-6 h-6" />
            <span className="hidden md:block text-xl font-bold">Reservas</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
