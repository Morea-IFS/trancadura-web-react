"use client";

import { useState } from "react";
import Header from "@/components/Header";
import api from "@/lib/api";
import Link from "next/link";
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaUserTimes, 
  FaUserCheck,
  FaSave,
  FaGoogle,
  FaSync,
  FaCog
} from "react-icons/fa";
import { MdCalendarMonth } from "react-icons/md";

// Interface para os dados do Google
interface ExtractedClass {
  subject: string;
  professor: string;
  lab: string;
  detectedStartTime: string; 
  selectedDate: string;      
  startTimeISO: string;      
  endTimeISO: string;        
  status: string;            
  statusMessage: string;
  dbUserId?: number;
  dbLabId?: number;
  saveStatus?: 'idle' | 'saved' | 'error';
}

export default function ReservasPage() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedClass[]>([]);
  const [error, setError] = useState("");

  const handleSyncGoogle = async () => {
    setLoading(true);
    setError("");
    setExtractedData([]);

    try {
      const response = await api.get("/reservations/sync-google");
      
      if (response.data && response.data.data) {
        const dataWithLocalState = response.data.data.map((item: any) => ({
          ...item,
          saveStatus: 'idle'
        }));
        setExtractedData(dataWithLocalState);
      } else {
        setError("Nenhum evento encontrado na agenda para os próximos 7 dias.");
      }
    } catch (err: any) {
      console.error("Erro na sincronização:", err);
      setError(err.response?.data?.message || "Falha ao conectar com o Google Calendar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReservations = async () => {
    const itemsToSave = extractedData.filter(
      item => item.status === 'PRONTO' && item.saveStatus !== 'saved'
    );

    if (itemsToSave.length === 0) {
      alert("Nenhum item válido para salvar.");
      return;
    }

    setSaving(true);

    const payload = itemsToSave.map(item => ({
      userId: item.dbUserId,
      labId: item.dbLabId,
      startTime: item.startTimeISO,
      endTime: item.endTimeISO      
    }));

    try {
      const response = await api.post("/reservations/batch", payload);
      const results = response.data.results;
      
      setExtractedData(prev => prev.map(item => {
        const myResult = results.find((r: any) => 
            r.reservation && 
            r.reservation.userId === item.dbUserId && 
            r.reservation.startTime === item.startTimeISO
        );

        if (myResult && myResult.status === 'SUCCESS') {
          return { ...item, saveStatus: 'saved' };
        }
        return item;
      }));

      alert(`${response.data.successCount} reservas criadas com sucesso!`);

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar reservas em lote.");
    } finally {
      setSaving(false);
    }
  };

  // Ícones de status
  const renderStatus = (item: ExtractedClass) => {
    if (item.status === 'PRONTO') {
      return (
        <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold border border-green-200">
          <FaCheckCircle /> Agendável
        </span>
      );
    }
    if (item.status === 'ERRO_USER') {
      return (
        <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold border border-red-200" title={item.statusMessage}>
          <FaUserTimes /> Prof. não achado
        </span>
      );
    }
    if (item.status === 'ERRO_LAB') {
      return (
        <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-2 py-1 rounded text-xs font-bold border border-orange-200" title={item.statusMessage}>
          <FaExclamationTriangle /> Lab desconhecido
        </span>
      );
    }
    return (
      <span className="text-gray-500 text-xs">{item.statusMessage}</span>
    );
  };

  return (
    <div>
      <Header labSelecionado={labSelecionado} setLabSelecionado={setLabSelecionado} />

      <section className="p-4 md:w-[90%] mx-auto flex flex-col gap-6 mb-10">
        
        {/* Cabeçalho da página com link para Configuração */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="font-bold text-2xl md:text-4xl text-center md:text-left">
            Sincronização <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">Google Calendar</span>
            </h1>
            
            <Link 
                href="/reservas/upload" 
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition"
            >
                <FaCog /> Configurar Semestre (PDF)
            </Link>
        </div>

        {/* Card Principal de Ação */}
        <div className="bg-white rounded-lg shadow-md border border-black/5 p-8 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
             <MdCalendarMonth className="text-blue-600 w-8 h-8" />
          </div>
          
          <div>
            <h2 className="font-bold text-xl text-gray-800">Sincronizar Agenda Acadêmica</h2>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              O sistema irá buscar os eventos dos próximos 7 dias na agenda do Google e tentará vincular Professores e Laboratórios automaticamente.
            </p>
          </div>

          <button 
            onClick={handleSyncGoogle} 
            disabled={loading} 
            className="flex items-center gap-3 py-3 px-8 bg-white border border-gray-300 text-gray-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSync className="animate-spin text-blue-500" /> Buscando eventos...
              </>
            ) : (
              <>
                <FaGoogle className="text-red-500" /> Sincronizar Agora
              </>
            )}
          </button>
          
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>}
        </div>

        {/* Tabela de Resultados */}
        {extractedData.length > 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
             
             {/* Barra de Totais e Salvar */}
             <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-10">
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-lg border border-green-200">
                      <FaCheckCircle />
                      <span className="font-bold">{extractedData.filter(i => i.status === 'PRONTO').length}</span>
                      <span className="text-sm">prontos para agendar</span>
                   </div>
                </div>

                <button 
                  onClick={handleSaveReservations}
                  disabled={saving || extractedData.filter(i => i.status === 'PRONTO' && i.saveStatus !== 'saved').length === 0}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {saving ? "Processando..." : <><FaSave /> Confirmar Agendamentos</>}
                </button>
             </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Horário</th>
                    <th className="px-4 py-3">Evento (Disciplina)</th>
                    <th className="px-4 py-3">Professor (Google)</th>
                    <th className="px-4 py-3">Laboratório (Local)</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((item, index) => (
                    <tr key={index} className={`border-b transition-colors ${item.saveStatus === 'saved' ? 'bg-green-50' : 'bg-white hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.saveStatus === 'saved' ? (
                            <span className="flex items-center gap-1 text-green-700 font-bold text-xs bg-white px-2 py-1 rounded border border-green-200 shadow-sm">
                              <FaCheckCircle /> Reservado
                            </span>
                        ) : renderStatus(item)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                         {new Date(item.startTimeISO).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                         <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                           {item.detectedStartTime}
                         </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[200px]" title={item.subject}>
                        {item.subject}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                         {item.status !== 'ERRO_USER' ? <FaUserCheck className="text-green-500"/> : <FaUserTimes className="text-red-300"/>}
                         <span className="truncate max-w-[150px]" title={item.professor}>{item.professor}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">
                          {item.lab}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              * Apenas eventos com Professor e Laboratório identificados podem ser agendados.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}