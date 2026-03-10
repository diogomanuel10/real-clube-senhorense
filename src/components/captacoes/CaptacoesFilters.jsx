import { Filter } from "lucide-react";

export default function CaptacoesFilters({
  filtroStatus,
  setFiltroStatus,
  filtroAprovacao,
  setFiltroAprovacao,
  filtroEscalao,
  setFiltroEscalao,
  escaloes,
  onResetFilters
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-semibold text-slate-700">Filtros</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Interesse do Treinador
          </label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
          >
            <option value="todos">Todos</option>
            <option value="interessado">Interessado</option>
            <option value="neutro">Neutro</option>
            <option value="nao-interessado">Não Interessado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Aprovação Direção
          </label>
          <select
            value={filtroAprovacao}
            onChange={(e) => setFiltroAprovacao(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
          >
            <option value="todos">Todos</option>
            <option value="sim">Aprovado</option>
            <option value="nao">Rejeitado</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Escalão
          </label>
          <select
            value={filtroEscalao}
            onChange={(e) => setFiltroEscalao(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
          >
            <option value="todos">Todos os escalões</option>
            {escaloes.map((esc) => (
              <option key={esc.id} value={esc.nome}>
                {esc.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onResetFilters}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
