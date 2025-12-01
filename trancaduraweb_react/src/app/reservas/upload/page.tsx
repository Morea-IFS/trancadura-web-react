"use client";

import { useState } from "react";
import Header from "@/components/Header";
import api from "@/lib/api";
import Link from "next/link";
import { 
  FaCloudUploadAlt, 
  FaCalendarCheck, 
  FaSpinner, 
  FaArrowLeft 
} from "react-icons/fa";

export default function PopulateCalendarPage() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState("");
  
  // Datas do Semestre
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setSuccessData(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !startDate || !endDate) {
      setError("Preencha todos os campos: Arquivo, Início e Fim do Semestre.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessData(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      // Chama a rota que popula o Google Calendar
      const response = await api.post("/reservations/populate-calendar", formData);
      setSuccessData(response.data);
    } catch (err: any) {
      console.error("Erro no upload:", err);
      setError(err.response?.data?.message || "Falha ao processar PDF e criar eventos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header labSelecionado={labSelecionado} setLabSelecionado={setLabSelecionado} />

      <section className="p-4 md:w-[80%] mx-auto flex flex-col gap-6 mb-10">
        
        {/* Botão de Voltar */}
        <div className="flex justify-start">
            <Link href="/reservas" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold">
                <FaArrowLeft /> Voltar para Sincronização
            </Link>
        </div>

        <h1 className="font-bold text-2xl md:text-4xl text-center">
          Popular <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">Google Calendar</span>
        </h1>

        <div className="bg-white rounded-lg shadow-md border border-black/5 p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b pb-2">
            <FaCalendarCheck className="text-blue-600 w-6 h-6" />
            <h2 className="font-bold text-lg text-gray-700">Configuração do Semestre</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Início das Aulas</label>
                <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded p-2"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fim do Semestre</label>
                <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded p-2"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-bold text-gray-700">Arquivo de Horário (PDF)</label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                />
                <button 
                onClick={handleUpload} 
                disabled={loading || !file} 
                className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-8 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-lg shadow-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                {loading ? (
                    <><FaSpinner className="animate-spin" /> Processando...</>
                ) : (
                    <><FaCloudUploadAlt /> Enviar e Criar Eventos</>
                )}
                </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-bold text-center">
                {error}
            </div>
          )}

          {successData && (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200 flex flex-col gap-2 text-center animate-fade-in">
                <h3 className="font-bold text-lg flex items-center justify-center gap-2">
                    <FaCalendarCheck /> Sucesso!
                </h3>
                <p>{successData.message}</p>
                <p className="font-bold text-2xl">{successData.eventsCreated} eventos criados</p>
                <p className="text-sm">{successData.details}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}