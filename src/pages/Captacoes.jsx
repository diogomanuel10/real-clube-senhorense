import { UserPlus, Plus } from "lucide-react";
import { useCaptacoes } from "../hooks/useCaptacoes";
import CaptacoesFilters from "../components/captacoes/CaptacoesFilters";
import CaptacaoCard from "../components/captacoes/CaptacaoCard";
import CaptacaoFormModal from "../components/captacoes/CaptacaoFormModal";
import CaptacaoDetailsModal from "../components/captacoes/CaptacaoDetailsModal";
import { useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';


export default function Captacoes({ user }) {

  const { id } = useParams();

  const {
    permissions,
    captacoes,
    escaloes,
    loading,
    showModal,
    setShowModal,
    showDetalhesModal,
    setShowDetalhesModal,
    modoEdicao,
    captacaoSelecionada,
    form,
    setForm,
    filtroStatus,
    setFiltroStatus,
    filtroAprovacao,
    setFiltroAprovacao,
    setCaptacaoSelecionada,
    filtroEscalao,
    setFiltroEscalao,
    abrirModalAdicionar,
    abrirModalEditar,
    abrirDetalhes,
    guardarCaptacao,
    apagarCaptacao,
    getBadgeInteresse,
    getBadgeAprovacao,
    onResetFilters
  } = useCaptacoes(user);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const captacaoId = urlParams.get('captacao');

    if (captacaoId && captacoes.length > 0) {
      // USA a função JÁ EXISTENTE do hook!
      const captacao = captacoes.find(c => c.id === captacaoId);
      if (captacao) {
        abrirDetalhes(captacao);  // ✅ FUNÇÃO DO HOOK
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [captacoes.length, abrirDetalhes]);



  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (escaloes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-6 h-6 text-[#0b1635]" />
            <h1 className="text-2xl font-bold text-slate-900">Captações</h1>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-2">
            Nenhum escalão disponível
          </p>
          <p className="text-sm text-slate-500">
            {permissions.isTreinador
              ? "Não tem equipas atribuídas. Contacte a administração."
              : "Ainda não existem escalões criados no sistema."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-6 h-6 text-[#0b1635]" />
              <h1 className="text-2xl font-bold text-slate-900">Captações</h1>
            </div>
            <p className="text-sm text-slate-600">
              Avaliação e acompanhamento de novos atletas
              {permissions.isTreinador && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {permissions.equipas.length} equipa
                  {permissions.equipas.length > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={abrirModalAdicionar}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0b1635] text-white rounded-xl text-sm sm:text-base font-medium hover:bg-[#152452] transition"
          >
            <Plus className="w-4 h-4" />
            Nova Captação
          </button>
        </div>
        <div className="w-full">
          {/* Filtros */}
          <CaptacoesFilters
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroAprovacao={filtroAprovacao}
            setFiltroAprovacao={setFiltroAprovacao}
            filtroEscalao={filtroEscalao}
            setFiltroEscalao={setFiltroEscalao}
            escaloes={escaloes}
            onResetFilters={onResetFilters}
          />
        </div>

        {/* Lista de captações */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : captacoes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {captacoes.length === 0
                ? "Nenhuma captação registada"
                : "Nenhuma captação encontrada com os filtros selecionados"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {captacoes.map((cap) => (
              <CaptacaoCard
                key={cap.id}
                cap={cap}
                onVer={() => abrirDetalhes(cap)}      // ← Modal DETALHES
                onApagar={() => apagarCaptacao(cap.id)}
                getBadgeInteresse={getBadgeInteresse}
                getBadgeAprovacao={getBadgeAprovacao}
              />
            ))}
          </div>
        )}

        {/* Modal Adicionar/Editar */}
        <CaptacaoFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          form={form}
          setForm={setForm}
          modoEdicao={modoEdicao}
          escaloes={escaloes}
          permissions={permissions}
          onSubmit={guardarCaptacao}
        />

        {/* Modal de Detalhes */}
        <CaptacaoDetailsModal
          open={showDetalhesModal}
          onClose={() => setShowDetalhesModal(false)}
          captacao={captacaoSelecionada}
          onEditar={abrirModalEditar}
          onApagar={apagarCaptacao}
          getBadgeInteresse={getBadgeInteresse}
          getBadgeAprovacao={getBadgeAprovacao}
          permissions={permissions}  // ← ADICIONA ESTA LINHA
        />
      </div>
    </div>
  );
}
