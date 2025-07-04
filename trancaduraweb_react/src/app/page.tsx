"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";
import HistoryCard from "@/components/HistoryCard";
import Header from "@/components/Header";
import { FaRegClock } from "react-icons/fa6";
import { IoLockClosedOutline } from "react-icons/io5";

export default function Home() {
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ultimoStatus, setUltimoStatus] = useState<
    "autorizado" | "negado" | null
  >(null);
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [nomeLabSelecionado, setNomeLabSelecionado] = useState<string | null>(
    null
  );

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        setUsuarioId(res.data.userId);
        setUsername(res.data.username || res.data.email);
      })
      .catch(() => {
        setUsuarioId(null);
        setUsername(null);
      });
  }, []);

  useEffect(() => {
    if (!usuarioId || !labSelecionado) return;
    api
      .get(`/devices/${labSelecionado}/all`)
      .then((res) => {
        const filtrados = res.data
          .filter((item: any) => item.userId === usuarioId)
          .slice(0, 3)
          .map((item: any) => ({
            ...item,
            nomeLab: nomeLabSelecionado,
          }));
        setAcessos(filtrados);
      })
      .catch((err) => {
        console.error("Erro ao buscar acessos:", err);
        setAcessos([]);
      });
  }, [usuarioId, labSelecionado, nomeLabSelecionado]);

  useEffect(() => {
    if (!labSelecionado) return;
    api.get(`/labs/${labSelecionado}`).then((res) => {
      setNomeLabSelecionado(res.data.name); // ou res.data.nome, conforme o backend
    });
  }, [labSelecionado]);

  const handleUnlock = async () => {
    if (!usuarioId) return alert("Usuário não identificado.");
    if (!labSelecionado) return alert("Selecione um laboratório.");

    setLoading(true);
    setUltimoStatus(null);

    try {
      const response = await api.post(`/labs/unlock/${labSelecionado}`, {
        deviceId: usuarioId,
      });

      console.log("Id do lab:", labSelecionado);
      const status = response.data.access?.permission ? "autorizado" : "negado";
      setUltimoStatus(status);
      alert(response.data.message || "Requisição enviada com sucesso!");

      const res = await api.get(`/devices/${labSelecionado}/all`);
      const filtrados = res.data
        .filter((item: any) => item.userId === usuarioId)
        .slice(0, 3)
        .map((item: any) => ({
          ...item,
          nomeLab: nomeLabSelecionado,
        }));
      setAcessos(filtrados);
    } catch (error: any) {
      console.error("Erro ao tentar desbloquear:", error);
      alert(
        "Erro ao desbloquear: " +
          (error?.response?.data?.message || "Erro desconhecido.")
      );
      setUltimoStatus("negado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <Header
          labSelecionado={labSelecionado}
          setLabSelecionado={setLabSelecionado}
        />
      </header>
      <section className="p-4">
        <div className="w-full mx-auto max-w-4xl p-4 flex items-center justify-center flex-col gap-1">
          <h1 className="font-bold text-2xl sm:text-4xl">
            Bem vindo, {username ? username : "usuário"}
          </h1>
          <p className="font-bold text-base sm:text-lg text-gray-600">
            Use o botão abaixo para controlar a tranca
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col gap-4 items-center justify-center w-88 p-12 bg-white rounded-lg shadow-md border border-gray-200">
            <button
              onClick={handleUnlock}
              disabled={loading}
              className={`cursor-pointer text-white p-8 rounded-full flex flex-col gap-4 items-center justify-center transition duration-200 hover:scale-105 active:scale-105 disabled:opacity-50 ${
                ultimoStatus === "autorizado"
                  ? "bg-green-500"
                  : ultimoStatus === "negado"
                  ? "bg-red-500"
                  : "bg-foreground"
              }`}
            >
              <IoLockClosedOutline className="w-16 h-16" />
              <span className="inline text-xl font-bold">
                {loading ? "Enviando..." : "Abrir tranca"}
              </span>
            </button>

            <div className="text-gray-600 text-sm w-full text-center">
              <p>
                Toque no botão para abrir a tranca <br /> A operação será
                registrada
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="p-4 md:w-[70%] mx-auto">
        <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex gap-2 items-center">
            <FaRegClock className="w-4 h-4 sm:w-6 sm:h-6 text-foreground font-bold" />
            <p className="text-lg sm:text-2xl font-bold">Operações Recentes</p>
          </div>
          <div className="text-gray-600 text-base sm:text-lg">
            <p>Suas últimas operações</p>
          </div>
          {acessos.length > 0 ? (
            acessos.map((item) => <HistoryCard key={item.id} acesso={item} />)
          ) : (
            <p className="text-gray-500 text-sm mt-4">
              Nenhum acesso encontrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
