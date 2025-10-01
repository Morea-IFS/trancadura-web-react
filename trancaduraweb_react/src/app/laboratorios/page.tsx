"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import CreateLabForm from "@/components/Forms/CreateLabForm";
import api from "@/lib/api";
import { IoPeopleSharp } from "react-icons/io5";

interface Lab {
  id: number;
  name: string;
  _count: {
    users: number;
  }
}

export default function LaboratoriosPage() {
  const [labSelecionado, setLabSelecionado] = useState<number | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false); // Estado para controlar permissões
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para o modal

  // Função para buscar os dados da página
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Busca os laboratórios e os dados do usuário em paralelo
      const [labsRes, meRes] = await Promise.all([
        api.get('/labs'),
        api.get('/users/me')
      ]);
      
      setLabs(labsRes.data);

      // Verifica se o usuário tem permissão para gerenciar
      const userRoles = meRes.data.roles?.map((r: any) => r.role.name) || [];
      if (userRoles.includes('superuser') || userRoles.includes('staff')) {
        setCanManage(true);
      }

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveNewLab = (newLab: Lab) => {
    const labWithCount = { ...newLab, _count: { users: 0 } };
    setLabs(prevLabs => [...prevLabs, labWithCount]);
  };

  return (
    <div>
      <Header
        labSelecionado={labSelecionado}
        setLabSelecionado={setLabSelecionado}
      />

      <section className="p-4 md:w-[70%] mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl md:text-4xl">
            Gerenciamento de{" "}
            <span className="bg-gradient-to-r from-blue-800 to-teal-500 bg-clip-text text-transparent">
              Laboratórios
            </span>
          </h1>
          {/* Botão para adicionar Lab, visível apenas para quem tem permissão */}
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Adicionar Lab
            </button>
          )}
        </div>

        {loading ? (
          <p>Carregando laboratórios...</p>
        ) : (
          <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)]">
            {labs.length > 0 ? (
              labs.map((lab) => (
                <div key={lab.id} className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold">{lab.name}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <IoPeopleSharp />
                    <span>{lab._count.users} {lab._count.users === 1 ? 'membro' : 'membros'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum laboratório encontrado.</p>
            )}
          </div>
        )}
      </section>

      {/* Modal para criar novo laboratório */}
      {isModalOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Adicionar Novo Laboratório
            </h2>
            <CreateLabForm 
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveNewLab}
            />
          </div>
        </div>
      )}
    </div>
  );
}