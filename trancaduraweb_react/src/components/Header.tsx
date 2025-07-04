import { useState, useEffect } from "react";
import MobileMenu from "@/components/Menus/MobileMenu";
import DesktopMenu from "@/components/Menus/DesktopMenu";
import api from "@/lib/api";

type HeaderProps = {
  labSelecionado: number | null;
  setLabSelecionado: (id: number) => void;
};

export default function Header({
  labSelecionado,
  setLabSelecionado,
}: HeaderProps) {
  const [labs, setLabs] = useState<{ id: number; name: string }[]>([]);

  // Carrega o lab salvo no localStorage ao montar
  useEffect(() => {
    const savedLab = localStorage.getItem("labSelecionado");
    if (savedLab) {
      setLabSelecionado(Number(savedLab));
    }
    api.get("/labs/me").then((res) => {
      setLabs(res.data);
      if (res.data.length > 0 && !savedLab && labSelecionado === null)
        setLabSelecionado(res.data[0].id);
    });
    // eslint-disable-next-line
  }, []);

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    if (labSelecionado !== null) {
      localStorage.setItem("labSelecionado", labSelecionado.toString());
    }
  }, [labSelecionado]);

  return (
    <header className="bg-foreground text-background w-full">
      <div className="flex justify-between items-center p-4">
        <div>
          <select
            value={labSelecionado ?? ""}
            onChange={(e) => setLabSelecionado(Number(e.target.value))}
            className="text-xl font-bold bg-background text-foreground p-2 rounded"
          >
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </div>
        <nav>
          <MobileMenu />
          <DesktopMenu />
        </nav>
      </div>
    </header>
  );
}
