import { useState } from "react";
import { CalendarDays, RefreshCw, Sparkles, Settings2 } from "lucide-react";
import { useTreinos } from "../hooks/useTreinos";
import { gerarTreinosParaPlano } from "../utils/gerarTreinos";
import Calendario from "../components/treinos/Calendario";
import { usePermissions } from '../hooks/usePermissions';
import { ModalPlanos, ModalDetalhes, ModalEditarTreino } from "../components/treinos/Modals";

export default function Treinos({ user }) {
  const { treinos, setTreinos, escaloes, planos, setPlanos, loading, recarregar } = useTreinos();
  const permissions = usePermissions(user);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [gerando, setGerando] = useState(false);
  
  // Modals
  const [showPlanosModal, setShowPlanosModal] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showEditarTreinoModal, setShowEditarTreinoModal] = useState(false);

  const handleGerarTreinosAno = async () => {
    if (!window.confirm("Gerar todos os treinos para o ano?")) return;

    setGerando(true);
    try {
      const inicio = new Date("2025-09-01");
      const fim = new Date("2026-06-30");

      for (const plano of planos) {
        await gerarTreinosParaPlano(plano, inicio, fim);
      }

      await recarregar();
      alert("Treinos gerados para o ano!");
    } catch (err) {
      console.error("Erro ao gerar treinos:", err);
      alert("Erro ao gerar treinos: " + err.message);
    } finally {
      setGerando(false);
    }
  };

const escaloesFiltrados = permissions.filterByEquipa(escaloes, 'nome');
const planosFiltrados = permissions.filterByEquipa(planos, 'equipa'); // ✅
const treinosFiltrados = permissions.filterByEquipa(treinos, 'equipa'); // ✅

  const handleMudarMes = (novoAno, novoMes) => {
    setCurrentYear(novoAno);
    setCurrentMonth(novoMes);
  };

  const handleTreinoClick = (treino) => {
    setTreinoSelecionado(treino);
  };

  const handleEditarClick = () => {
    setShowEditarTreinoModal(true);
  };

  const handleSaveDetalhes = (novosDados) => {
    // Atualizar treinos no estado
    setTreinos((prev) =>
      prev.map((t) =>
        t.id === treinoSelecionado.id ? { ...t, ...novosDados } : t
      )
    );
    // Atualizar treino selecionado
    setTreinoSelecionado({ ...treinoSelecionado, ...novosDados });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Melhorado */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 md:px-8 py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Treinos</h1>
                <p className="text-xs md:text-sm text-slate-600">
                  Calendário anual de treinos e presenças
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowPlanosModal(true)}
                className="px-3 md:px-4 py-2 rounded-lg bg-white text-slate-700 text-xs md:text-sm font-medium flex items-center space-x-2 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Gerir planos</span>
                <span className="sm:hidden">Planos</span>
              </button>

              <button
                onClick={handleGerarTreinosAno}
                disabled={gerando}
                className="px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs md:text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                {gerando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">A gerar…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Gerar treinos do ano</span>
                    <span className="sm:hidden">Gerar</span>
                  </>
                )}
              </button>

              <button
                onClick={recarregar}
                className="px-3 py-2 rounded-lg bg-white text-slate-700 text-xs md:text-sm border border-slate-300 flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6">
        <Calendario
          ano={currentYear}
          mes={currentMonth}
          treinos={treinosFiltrados}
          escaloes={escaloesFiltrados}
          loading={loading}
          onMudarMes={handleMudarMes}
          onTreinoClick={handleTreinoClick}
        />
      </main>

      {/* Modals */}
      {showPlanosModal && (
        <ModalPlanos
          escaloes={escaloesFiltrados}
          planos={planosFiltrados}
          onClose={() => setShowPlanosModal(false)}
          onUpdate={() => {
            recarregar();
          }}
        />
      )}

      {treinoSelecionado && !showEditarTreinoModal && (
        <ModalDetalhes
          treino={treinoSelecionado}
          onClose={() => setTreinoSelecionado(null)}
          onEditarClick={handleEditarClick}
        />
      )}

      {showEditarTreinoModal && treinoSelecionado && (
        <ModalEditarTreino
          treino={treinoSelecionado}
          onClose={() => setShowEditarTreinoModal(false)}
          onSave={handleSaveDetalhes}
        />
      )}
    </div>
  );
}
