"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation"; // Importação Adicionada
import {
  MdOutlineSensorDoor,
  MdWaterDrop,
  MdElectricBolt,
  MdSecurity,
  MdOutlineSavings,
  MdCode,
} from "react-icons/md";
import { FaArrowRight, FaReact, FaNodeJs, FaMicrochip } from "react-icons/fa";
import { SiNestjs, SiTypescript } from "react-icons/si";

export default function Home() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans overflow-x-hidden">
      {/* Estilo Global para a Animação de Flutuação */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>

      <Header
        labSelecionado={labSelecionado}
        setLabSelecionado={setLabSelecionado}
      />

      {/* Hero Section */}
      <section className="relative min-h-[600px] md:h-[700px] flex items-center justify-center bg-gray-900 text-white pb-20 pt-10 md:pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 z-0 animate-gradient-xy"></div>
        <div className="absolute inset-0 opacity-10 z-0"></div>
        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-blue-300 text-xs md:text-sm font-semibold tracking-wider uppercase">
            Inovação em IoT no IFS Campus Lagarto
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-4 tracking-tight leading-tight">
            O Futuro do Campus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-300 to-blue-500 block mt-2">
              Inteligente & Sustentável
            </span>
          </h1>

          {/* Type Animation Aqui */}
          <div className="h-16 mb-6 flex items-center justify-center">
            <TypeAnimation
              sequence={[
                "Controle de Acesso Modular",
                2000,
                "Monitoramento de Energia e Água",
                2000,
                "Segurança com Tecnologia Aberta",
                2000,
                "Gestão Inteligente de Recursos",
                2000,
              ]}
              wrapper="span"
              speed={50}
              style={{
                fontSize: "1.5rem",
                display: "inline-block",
                fontWeight: "bold",
                color: "#60A5FA",
              }} // cor blue-400
              repeat={Infinity}
            />
          </div>

          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed mx-auto">
            O projeto <strong>MOREA</strong> une segurança física e eficiência
            energética através de soluções modulares de baixo custo e código
            aberto.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
            <a
              href="#solutions"
              onClick={(e) => handleScroll(e, "solutions")}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 cursor-pointer text-center"
            >
              Acessar Sistemas
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#about"
              onClick={(e) => handleScroll(e, "about")}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer text-center"
            >
              Conhecer o Projeto
            </a>
          </div>
        </div>
      </section>

      {/* Seção de Soluções */}
      <section
        id="solutions"
        className="py-16 md:py-20 px-4 md:px-8 max-w-7xl mx-auto -mt-16 md:-mt-24 relative z-30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card Trancadura - Animação Normal */}
          <Link href="/trancadura" className="group h-full block animate-float">
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-white/50 hover:border-blue-200 transition duration-500 transform hover:-translate-y-2 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg">
                <MdOutlineSensorDoor className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition">
                Trancadura 2.0
              </h2>
              <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg leading-relaxed flex-grow">
                Sistema de controle de acesso modular. Gerencie laboratórios,
                permissões via RFID/App e logs de auditoria.
              </p>

              <div className="flex items-center text-blue-700 font-bold tracking-wide group-hover:gap-4 gap-2 transition-all text-sm md:text-base">
                ABRIR PAINEL <FaArrowRight />
              </div>
            </div>
          </Link>

          {/* Card Sparc - Animação com Delay (Desencontrada) */}
          <Link
            href="/dashboard/metering"
            className="group h-full block animate-float-delay"
          >
            <div className="bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-xl border border-white/50 hover:border-teal-200 transition duration-500 transform hover:-translate-y-2 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-400 to-green-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg">
                <MdElectricBolt className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 group-hover:text-teal-700 transition">
                Sparc Monitor
              </h2>
              <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg leading-relaxed flex-grow">
                Monitoramento inteligente de recursos. Visualize gráficos de
                consumo de energia e água em tempo real.
              </p>

              <div className="flex items-center text-teal-700 font-bold tracking-wide group-hover:gap-4 gap-2 transition-all text-sm md:text-base">
                VER DASHBOARD <FaArrowRight />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Sobre o Projeto */}
      <section id="about" className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Tecnologia com Propósito
            </h2>
            <div className="w-16 md:w-24 h-1.5 bg-gradient-to-r from-blue-600 to-teal-400 mx-auto rounded-full"></div>
            <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Desenvolvido no IFS Campus Lagarto, o Morea busca resolver
              problemas reais de segurança e desperdício utilizando hardware
              acessível e software moderno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16 md:mb-24">
            <FeatureCard
              icon={<MdOutlineSavings />}
              title="Baixo Custo"
              desc="Soluções desenvolvidas com ESP32 e impressão 3D, custando até 50% menos que alternativas comerciais."
              color="blue"
            />
            <FeatureCard
              icon={<MdSecurity />}
              title="Segurança Moderna"
              desc="Comunicação criptografada (HTTPS), autenticação via JWT e atualizações remotas (OTA)."
              color="indigo"
            />
            <FeatureCard
              icon={<MdCode />}
              title="Open Source"
              desc="Código aberto para promover a colaboração acadêmica e a transparência no desenvolvimento."
              color="teal"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1 col-span-1 lg:col-span-2 text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                Ecossistema Integrado
              </h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
                O sistema utiliza uma arquitetura moderna para garantir
                escalabilidade. No hardware, sensores de vazão e módulos RFID
                conectam-se ao microcontrolador <strong>ESP32</strong>. No
                servidor, uma API robusta processa requisições em tempo real,
                gerenciando permissões de acesso e acumulando dados de
                telemetria.
              </p>
            </div>

            {/* Detalhe SPARC */}
            <div className="order-1 lg:order-1 relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl group bg-gray-100 border border-gray-200">
              <Image
                src="/images/image-1.png"
                alt="Sensor Sparc"
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm z-10">
                <p className="text-teal-800 font-bold text-sm">
                  Sensor Sparc (Água)
                </p>
              </div>
            </div>

            <div className="order-2 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <MdElectricBolt /> Eficiência Energética
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sparc: Monitoramento Inteligente
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                O Sparc utiliza sensores não invasivos para medir o consumo de
                energia elétrica e fluxo de água em tempo real. Os dados são
                enviados para o servidor a cada 5 minutos, permitindo a detecção
                precoce de vazamentos e o acompanhamento de metas de economia.
              </p>
              <ul className="space-y-2 mt-2 text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>{" "}
                  Sensor de Fluxo YF-S201
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>{" "}
                  Medição de Corrente SCT-013
                </li>
              </ul>
            </div>

            {/* Detalhe TRANCADURA */}
            <div className="order-4 lg:order-3 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                <MdSecurity /> Segurança Física
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Trancadura: Controle de Acesso
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                A Trancadura substitui chaves físicas por cartões RFID e
                controle via aplicativo. O sistema mantém um log auditável de
                quem entrou em cada laboratório e quando, além de permitir o
                bloqueio remoto de portas em caso de emergência.
              </p>
              <ul className="space-y-2 mt-2 text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>{" "}
                  Leitor RFID MFRC522
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>{" "}
                  Solenóide 12V com Relé
                </li>
              </ul>
            </div>

            <div className="order-3 lg:order-4 relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl group bg-gray-100 border border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition duration-700 bg-gradient-to-br from-blue-50 to-blue-100">
                <MdOutlineSensorDoor className="text-8xl text-blue-300" />
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm">
                <p className="text-blue-800 font-bold text-sm">
                  Protótipo Trancadura
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer com Logos */}
      <footer className="bg-blue-950 text-gray-300 py-10 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-white mb-2">Projeto MOREA</h4>
            <p className="text-sm text-gray-400">
              Instituto Federal de Sergipe - Campus Lagarto
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
              <Image
                src="/images/logo-ifs.png"
                alt="Logo IFS"
                width={60}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="relative bg-white rounded-lg p-2 flex items-center justify-center shadow-lg">
              <Image
                src="/images/logo-propex.png"
                alt="Logo Propex"
                width={220}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            © 2025 Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  const colorClasses: any = {
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    teal: "bg-teal-100 text-teal-600",
  };

  return (
    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition duration-300 h-full">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
