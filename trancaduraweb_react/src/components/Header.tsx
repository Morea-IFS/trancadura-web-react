import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

import { MdOutlineSensorDoor, MdMenu, MdClose, MdOutlineLock, MdDateRange } from "react-icons/md";
import { IoExitOutline, IoPeopleSharp } from "react-icons/io5";
import { FiChevronsDown, FiBarChart2 } from "react-icons/fi";
import { FaHistory, FaHome } from "react-icons/fa";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-teal-500 text-background w-full shadow-xl relative z-50">
      <div className="flex flex-col p-4 gap-4 md:gap-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
                <MdOutlineSensorDoor className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <div className="font-bold">
                <p className="text-base md:text-xl font-bold bg-gradient-to-r from-green-200 to-teal-200 bg-clip-text text-transparent">
                  MOREA
                </p>
                <p className="text-xs md:text-base">Trancadura WEB</p>
              </div>
            </div>
          </Link>

          {/* Botão Hamburguer (Mobile) */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <MdClose className="w-8 h-8" />
            ) : (
              <MdMenu className="w-8 h-8" />
            )}
          </button>

          {/* Botão Sair (Desktop) */}
          <Link
            href="/logout"
            className="hidden md:flex w-12 h-12 md:w-40 md:gap-2 bg-white/20 border border-white/20 rounded-lg items-center justify-center cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:bg-white/30"
          >
            <IoExitOutline className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-xl font-bold">Sair</span>
          </Link>
        </div>

        {/* Select dos laboratórios (Visível sempre ou condicionalmente no mobile, aqui mantive visível) */}
        <div>
          <Listbox value={labSelecionado} onChange={setLabSelecionado}>
            <div className="relative w-full">
              <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white/20 p-2 md:p-4 text-left text-white font-bold border border-white/20 shadow-md transition-transform duration-300 hover:bg-white/30 outline-none flex items-center justify-between">
                <span className="block truncate">
                  {labs.find((lab) => lab.id === labSelecionado)?.name ??
                    "Selecione um lab"}
                </span>
                <span className="pointer-events-none flex items-center pr-2">
                  <FiChevronsDown
                    className="h-5 w-5 md:h-6 md:w-6 text-white font-bold"
                    aria-hidden="true"
                  />
                </span>
              </ListboxButton>

              <ListboxOptions className="text-black absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-black z-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {labs.map((lab) => (
                  <ListboxOption
                    key={lab.id}
                    value={lab.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none p-2 m-2 rounded transition-colors outline-none
                      ${active ? "bg-teal-300 font-bold text-black" : "bg-white text-black"}`
                    }
                  >
                    {({ selected }) => (
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {lab.name}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Navegação Desktop */}
        <div className="hidden md:flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
           <NavLink href="/" icon={<FaHome className="w-6 h-6" />} label="Home" />
           <NavLink href="/trancadura" icon={<MdOutlineLock className="w-6 h-6" />} label="Tranca" />
           <NavLink href="/historico" icon={<FaHistory className="w-6 h-6" />} label="Histórico" />
           <NavLink href="/membros" icon={<IoPeopleSharp className="w-6 h-6" />} label="Membros" />
           <NavLink href="/dispositivos" icon={<CiRouter className="w-6 h-6" />} label="Dispositivos" />
           <NavLink href="/laboratorios" icon={<LuHotel className="w-6 h-6" />} label="Labs" />
           <NavLink href="/reservas" icon={<MdDateRange className="w-6 h-6" />} label="Reservas" />
           <NavLink href="/dashboard/metering" icon={<FiBarChart2 className="w-6 h-6" />} label="Consumo" title="Consumo" />
        </div>

        {/* Menu Mobile (Dropdown) */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-2 mt-2 bg-white/10 rounded-lg p-4 border border-white/10 backdrop-blur-md animate-fade-in-down">
             <MobileNavLink href="/" icon={<FaHome className="w-5 h-5" />} label="Home" onClick={closeMobileMenu} />
             <MobileNavLink href="/trancadura" icon={<MdOutlineLock className="w-5 h-5" />} label="Tranca" onClick={closeMobileMenu} />
             <MobileNavLink href="/historico" icon={<FaHistory className="w-5 h-5" />} label="Histórico" onClick={closeMobileMenu} />
             <MobileNavLink href="/membros" icon={<IoPeopleSharp className="w-5 h-5" />} label="Membros" onClick={closeMobileMenu} />
             <MobileNavLink href="/dispositivos" icon={<CiRouter className="w-5 h-5" />} label="Dispositivos" onClick={closeMobileMenu} />
             <MobileNavLink href="/laboratorios" icon={<LuHotel className="w-5 h-5" />} label="Labs" onClick={closeMobileMenu} />
             <MobileNavLink href="/reservas" icon={<MdDateRange className="w-5 h-5" />} label="Reservas" onClick={closeMobileMenu} />
             <MobileNavLink href="/dashboard/metering" icon={<FiBarChart2 className="w-5 h-5" />} label="Consumo" onClick={closeMobileMenu} />
             
             <div className="h-px bg-white/20 my-2"></div>
             
             <Link
              href="/logout"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 transition-colors text-white font-bold"
            >
              <IoExitOutline className="w-5 h-5" />
              <span>Sair</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

// Componentes Auxiliares para evitar repetição

function NavLink({ href, icon, label, title }: { href: string; icon: React.ReactNode; label: string; title?: string }) {
  return (
    <Link
      href={href}
      title={title}
      className="min-w-[8rem] px-4 py-2 bg-white/20 border border-white/20 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:bg-white/30 text-white"
    >
      {icon}
      <span className="text-base font-bold whitespace-nowrap">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 transition-colors text-white font-medium"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}