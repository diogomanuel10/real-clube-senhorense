import { Eye, Pencil, Trash2 } from "lucide-react";

export default function CaptacaoCard({
  cap,
  onVer,
  onEditar,
  onApagar,
  getBadgeInteresse,
  getBadgeAprovacao,
  permissions, // 👈 adicionar esta prop
}) {
  const isTreinador = permissions?.isTreinador;
  const isDirecao = !isTreinador;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0b1635] flex items-center justify-center text-white font-semibold">
            {cap.nome?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{cap.nome}</h3>
            <p className="text-xs text-slate-500">
              {cap.idade} anos · {cap.escalao}
            </p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeInteresse(
            cap.interesse
          )}`}
        >
          {cap.interesse === "interessado"
            ? "Interessado"
            : cap.interesse === "neutro"
            ? "Neutro"
            : "Não Interessado"}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeAprovacao(
            cap.aprovadoDirecao
          )}`}
        >
          {cap.aprovadoDirecao === "sim"
            ? "✓ Aprovado"
            : cap.aprovadoDirecao === "nao"
            ? "✗ Rejeitado"
            : "⏳ Pendente"}
        </span>
      </div>

      {/* Info resumida */}
      <div className="space-y-1 text-xs text-slate-600 mb-4">
        {cap.anosVoleibol && <p>🏐 {cap.anosVoleibol} anos de voleibol</p>}
        {cap.exClubes && <p>🏛️ {cap.exClubes}</p>}
        {cap.telemovel && <p>📱 {cap.telemovel}</p>}
        {cap.encarregadoNome && <p>👤 Enc.: {cap.encarregadoNome}</p>}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        {/* Todos podem ver */}
        <button
          onClick={onVer}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
        >
          <Eye className="w-3 h-3" />
          Ver
        </button>

        {/* Só treinador pode editar/apagar */}
        {isTreinador && (
          <>
            <button
              onClick={onEditar}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
            <button
              onClick={onApagar}
              className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
