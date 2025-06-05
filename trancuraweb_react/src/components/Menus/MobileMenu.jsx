"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Botão de menu móvel */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 text-secundary hover:text-primary focus:outline-none transition-transform duration-300 ${
          isOpen ? "-rotate-90" : "rotate-0"
        }`}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Menu lateral compacto */}
      <div
        className={`fixed top-20 right-4 z-50 w-[120px] h-[180px] flex flex-col items-start justify-center bg-black shadow-xl rounded-lg p-4 
          transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "translate-y-0 opacity-100 visible"
              : "-translate-y-4 opacity-0 invisible"
          }`}
      >
        {/* Conteúdo do menu */}
        <nav className="flex justify-center">
          <ul className="space-y-4 flex flex-col items-start w-full text-[18px]">
            <li>
              <a
                className="flex w-full justify-end gap-1"
                href="/"
                onClick={() => setIsOpen(false)}
              >
                Tranca
              </a>
            </li>
            <li>
              <a
                className="flex w-full justify-end gap-1"
                href="/historico"
                onClick={() => setIsOpen(false)}
              >
                Histórico
              </a>
            </li>
            <li>
              <a
                className="flex w-full justify-end gap-1"
                href="/membros"
                onClick={() => setIsOpen(false)}
              >
                Membros
              </a>
            </li>
            <li>
              <a
                className="flex w-full justify-end gap-1"
                href="/logout"
                onClick={() => setIsOpen(false)}
              >
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
