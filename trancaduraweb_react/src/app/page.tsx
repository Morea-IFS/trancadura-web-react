"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";
import HistoryCard from "@/components/HistoryCard";
import Header from "@/components/Header";

// Import do icones
import { FaRegClock } from "react-icons/fa6";
import { IoLockClosedOutline } from "react-icons/io5";
import { SlGraph } from "react-icons/sl";
import { CiDiscount1 } from "react-icons/ci";
import { HiOutlineStatusOnline } from "react-icons/hi";

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

  // Pega os dados do usuário logado
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

  // Pega os acessos do usuário no laboratório selecionado
  useEffect(() => {
    if (!usuarioId || !labSelecionado) return;
    api
      .get(`/devices/${labSelecionado}/all`)
      .then((res) => {
        const filtrados = res.data
          .filter((item: any) => item.userId === usuarioId)
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

  // Pega o nome do laboratório selecionado
  useEffect(() => {
    if (!labSelecionado) return;
    api.get(`/labs/${labSelecionado}`).then((res) => {
      setNomeLabSelecionado(res.data.name); // ou res.data.nome, conforme o backend
    });
  }, [labSelecionado]);

  // Função para desbloquear a tranca
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

      <section className="p-4 flex flex-col min-w-full gap-6 md:px-40 md:mt-15 md:mb-15">
        {/* Título */}
        <div className="w-full text-center flex flex-col items-center justify-center gap-2">
          <h1 className="font-bold text-2xl text-center md:text-4xl">
            Bem-vindo, {""}
            <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">
              {username ? username : "Usuário Desconhecido"}
            </span>
          </h1>
          <p className="text-sm md:text-lg">
            Controle sua tranca eletrônica de forma segura e inteligente. Todas
            as operações são monitoradas e registradas.
          </p>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-4 font-bold md:flex-row">
          {/* Total de Operações no Laboratório */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-fuchsia-300 rounded-lg shadow-md w-full h-24">
            <div className="flex items-start justify-center flex-col">
              <div className="text-sm md:text-lg">
                Total de Operações no Laboratório
              </div>
              <div className="text-2xl font-bold md:text-3xl">
                {acessos.length > 0 ? `${acessos.length}` : "0"}
              </div>
            </div>
            <div>
              <SlGraph className="w-12 h-12" />
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-400 rounded-lg shadow-md w-full h-24">
            <div className="flex items-start justify-center flex-col">
              <div className="text-sm md:text-lg">Taxa de Sucesso</div>
              <div className="text-2xl font-bold md:text-3xl">
                {acessos.length > 0
                  ? `${Math.round(
                      (acessos.filter((a) => a.permission === true).length /
                        acessos.length) *
                        100
                    )}%`
                  : "0%"}
              </div>
            </div>
            <div>
              <CiDiscount1 className="w-12 h-12" />
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="text-white flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-lime-300 rounded-lg shadow-md w-full h-24">
            <div className="flex items-start justify-center flex-col">
              <div className="text-sm md:text-lg">Status do Sistema</div>
              <div className="text-2xl font-bold md:text-3xl">Online</div>
            </div>
            <div>
              <HiOutlineStatusOnline className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Tranca */}
        <div className="flex flex-col gap-4 items-center justify-center w-full p-12 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <button
            onClick={handleUnlock}
            disabled={loading}
            className={`cursor-pointer text-white p-8 rounded-full flex flex-col gap-4 items-center justify-center transition duration-200 hover:scale-105 active:scale-105 disabled:opacity-50 ${
              ultimoStatus === "autorizado"
                ? "bg-gradient-to-r from-green-500 to-lime-300"
                : ultimoStatus === "negado"
                ? "bg-gradient-to-r from-red-700 to-rose-300"
                : "bg-gradient-to-r from-blue-800 to-teal-500"
            }`}
          >
            <IoLockClosedOutline className="w-16 h-16" />
            <span className="inline text-xl font-bold">
              {loading ? "Enviando..." : "Abrir tranca"}
            </span>
          </button>

          <div className="text-sm w-full text-center md:text-lg">
            <p>
              Toque no botão para abrir a tranca <br /> A operação será
              registrada
            </p>
          </div>
        </div>

        {/* Operações Recentes */}
        <div className="p-4 w-full flex items-start justify-center flex-col gap-2 bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-violet-500 to-fuchsia-300 text-white font-bold rounded-md flex items-center justify-center">
              <FaRegClock className="w-4 h-4 md:w-6 md:h-6 stroke-[2]" />
            </div>
            <p className="text-lg font-bold md:text-2xl">Operações Recentes</p>
          </div>
          <div className="text-sm md:text-lg">
            <p>Suas últimas tentaticas de abertura</p>
          </div>
          {acessos.length > 0 ? (
            acessos
              .slice(0, 3)
              .map((item) => <HistoryCard key={item.id} acesso={item} />)
          ) : (
            <p className="text-sm mt-4">Nenhum acesso encontrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
