"use client";

import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import {
  MdOutlineSensorDoor,
  MdSecurity,
  MdWifiTethering,
  MdAdminPanelSettings,
  MdHistory,
  MdCode,
} from "react-icons/md";
import { FaArrowRight, FaKey } from "react-icons/fa";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function Home() {
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
    <div className="bg-gray-50 min-h-screen font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Header */}
      <Header />

      <section className="relative min-h-[100svh] flex items-center justify-center bg-gray-950 text-white pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 z-0"></div>
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-[0.03] z-0"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full z-0 animate-pulse-slow"></div>

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-md text-blue-300 text-xs md:text-sm font-semibold tracking-widest uppercase"
          >
            <MdSecurity className="w-4 h-4" />
            Projeto Morea • IFS Campus Lagarto
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-8xl font-extrabold mb-6 tracking-tighter leading-[1.1]"
          >
            O Fim das <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Chaves Físicas.
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="h-16 md:h-20 mb-6 flex items-center justify-center"
          >
            <TypeAnimation
              sequence={[
                "Acesso Modular via Cartão RFID", 2500,
                "Auditoria e Logs em Tempo Real", 2500,
                "Bloqueio Remoto de Laboratórios", 2500,
                "Gestão Web Centralizada", 2500,
              ]}
              wrapper="span"
              speed={50}
              className="text-xl md:text-3xl font-medium text-blue-200"
              repeat={Infinity}
            />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed mx-auto font-light"
          >
            A <strong>Trancadura 2.0</strong> substitui o modelo tradicional de acesso por um ecossistema IoT seguro, rastreável e de baixo custo.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 w-full justify-center px-4"
          >
            <Link 
              href="/dashboard" 
              className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                Acessar Painel <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a 
              href="#features" 
              onClick={(e) => handleScroll(e, "features")}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center cursor-pointer"
            >
              Conhecer Arquitetura
            </a>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Controle Total em Suas Mãos</h2>
          <p className="mt-4 text-xl text-gray-500 font-light">Segurança de nível corporativo adaptada para o ambiente acadêmico.</p>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr"
        >
          <motion.div variants={fadeIn} className="md:col-span-2 bg-gradient-to-br from-gray-900 to-blue-950 p-10 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
              <MdOutlineSensorDoor className="w-64 h-64" />
            </div>
            <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-blue-400/20">
              <MdWifiTethering className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-4 relative z-10">Módulos Independentes</h3>
            <p className="text-gray-300 text-lg leading-relaxed relative z-10 max-w-lg">
              Cada porta funciona como um nó IoT autônomo baseado no ESP32. Eles validam chaves JWT localmente e sincronizam o histórico com o servidor central quando há conexão.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <MdAdminPanelSettings className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Permissões</h3>
            <p className="text-gray-600 leading-relaxed">
              Atribua tags RFID para professores ou alunos. Determine quem pode abrir qual laboratório e em quais horários específicos.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <MdHistory className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Auditoria Completa</h3>
            <p className="text-gray-600 leading-relaxed">
              Fim do mistério. O painel web registra exatamente quem destrancou a porta, a que horas e se o acesso foi autorizado ou negado.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="md:col-span-2 bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-8 hover:-translate-y-2 transition-transform duration-300">
            <div className="flex-1">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <MdCode className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tecnologia Open Source</h3>
              <p className="text-gray-600 leading-relaxed">
                Hardware desenhado para o menor custo possível utilizando Leitor RFID MFRC522 e Solenoide 12V. Cases projetadas e impressas em 3D dentro da própria instituição.
              </p>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-2xl p-6 border border-gray-200">
               <ul className="space-y-4">
                 <li className="flex items-center gap-3 font-semibold text-gray-700"><FaKey className="text-blue-500" /> Leitor RFID 13.56MHz</li>
                 <li className="flex items-center gap-3 font-semibold text-gray-700"><FaKey className="text-blue-500" /> Microcontrolador NodeMCU</li>
                 <li className="flex items-center gap-3 font-semibold text-gray-700"><FaKey className="text-blue-500" /> API RESTful (NestJS)</li>
               </ul>
            </div>
          </motion.div>

        </motion.div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.png')] opacity-5 z-0"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Como Funciona a <span className="text-blue-400">Integração</span></h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-24">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1 space-y-6">
                <div className="text-6xl font-black text-white/10">01</div>
                <h3 className="text-3xl font-bold">Leitura Física (Hardware)</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  O usuário aproxima a tag RFID da case fixada ao lado da porta do laboratório. O leitor MFRC522 captura o código único (UID) e repassa para o microcontrolador ESP32.
                </p>
              </div>
              <div className="flex-1 w-full h-72 bg-gray-800 rounded-3xl border border-gray-700 flex items-center justify-center relative shadow-2xl">
                 <div className="animate-float">
                   <FaKey className="text-6xl text-blue-400" />
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex flex-col md:flex-row-reverse items-center gap-12"
            >
              <div className="flex-1 space-y-6">
                <div className="text-6xl font-black text-white/10">02</div>
                <h3 className="text-3xl font-bold">Autenticação (Software)</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  O ESP32 criptografa a requisição e envia para nossa API em NestJS. O sistema verifica no banco de dados se aquela Tag possui autorização vigente para aquela porta específica.
                </p>
              </div>
              <div className="flex-1 w-full h-72 bg-gray-800 rounded-3xl border border-gray-700 flex items-center justify-center relative shadow-2xl">
                 <div className="animate-float" style={{ animationDelay: '1s' }}>
                   <MdSecurity className="text-7xl text-indigo-400" />
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="flex-1 space-y-6">
                <div className="text-6xl font-black text-white/10">03</div>
                <h3 className="text-3xl font-bold">Ação e Registro</h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Se aprovado, a API retorna um token de sucesso. O ESP32 aciona o relé que recolhe o pino da fechadura solenoide, abrindo a porta. Simultaneamente, o Dashboard é atualizado com o novo log de acesso.
                </p>
              </div>
              <div className="flex-1 w-full h-72 bg-gray-800 rounded-3xl border border-gray-700 flex items-center justify-center relative shadow-2xl">
                 <div className="animate-float" style={{ animationDelay: '2s' }}>
                   <MdOutlineSensorDoor className="text-7xl text-green-400" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black text-gray-900 tracking-tight">TRANCADURA <span className="text-blue-600">2.0</span></h4>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Instituto Federal de Sergipe - Campus Lagarto
            </p>
            <p className="text-xs text-gray-400 mt-4">
              © 2026 Projeto MOREA. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <Image
              src="/images/logo-ifs.png"
              alt="Logo IFS"
              width={70}
              height={50}
              className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image
              src="/images/logo-propex.png"
              alt="Logo Propex"
              width={180}
              height={60}
              className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}