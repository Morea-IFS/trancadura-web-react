"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DispLabs() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSuperuserAndLabs() {
      try {
        const userRes = await api.get("/users/me");
        const isSuperuser = userRes.data.roles?.some(
          (r: any) => r?.role?.name === "superuser"
        );
        if (!isSuperuser) {
          router.replace("/");
          return;
        }
        const labsRes = await api.get("/labs/me");
        if (labsRes.data.length > 0) {
          setLabSelecionado(labsRes.data[0].id);
        }
      } catch (err) {
        router.replace("/");
      }
    }
    checkSuperuserAndLabs();
  }, [router]);

  return (
    <div>
      <header>
        <Header
          labSelecionado={labSelecionado}
          setLabSelecionado={setLabSelecionado}
        />
      </header>
    </div>
  );
}
