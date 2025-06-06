import React from "react";
import Link from "next/link";

const DesktopMenu: React.FC = () => {
  return (
    <ul className="hidden md:flex gap-4 text-lg">
      <li>
        <Link href="/" className="">
          Tranca
        </Link>
      </li>
      <li>
        <Link href="/historico" className="">
          Histórico
        </Link>
      </li>
      <li>
        <Link href="/membros" className="">
          Membros
        </Link>
      </li>
      <li>
        <Link href="/logout" className="">
          Logout
        </Link>
      </li>
    </ul>
  );
};

export default DesktopMenu;
