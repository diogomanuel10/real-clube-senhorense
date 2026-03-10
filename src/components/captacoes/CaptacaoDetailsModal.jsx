import { X, Pencil, Trash2, User, Shield } from "lucide-react";
import { doc, updateDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function CaptacaoDetailsModal({
  open,
  onClose,
  captacao,
  onEditar,
  onApagar,
  getBadgeInteresse,
  getBadgeAprovacao,
  permissions,
  onAprovarAtleta // Nova prop do hook
}) {
  if (!open || !captacao) return null;

  const isTreinador = permissions.isTreinador;
  const isDirecao = !isTreinador;
  const isPendente = captacao.aprovadoDirecao === "pendente";

  // Função para aprovar e criar atleta
  const aprovarEcriarAtleta = async () => {
    if (!confirm(`Aprovar "${captacao.nome}" e criar atleta no escalão ${captacao.escalao}?`)) {
      return;
    }

    try {
      // 1. Criar atleta
      const novoAtleta = {
        nome: captacao.nome,
        idade: parseInt(captacao.idade),
        escalao: captacao.escalao,
        posicao: captacao.posicao || null,
        telemovel: captacao.telemovel || "",
        email: captacao.email || "",
        encarregadoNome: captacao.encarregadoNome || "",
        encarregadoTelefone: captacao.encarregadoTelefone || "",
        dataIncricao: new Date().toISOString(),
        dataNascimento: null, // direção completa depois
        ativo: true,
        origemCaptacao: captacao.id,
        pontosPositivos: captacao.pontosPositivos,
        pontosNegativos: captacao.pontosNegativos,
        anosVoleibol: captacao.anosVoleibol
      };

      const atletaRef = await addDoc(collection(db, "atletas"), novoAtleta);

      // 2. Adicionar ao escalão
      const escalaoRef = doc(db, "escaloes", captacao.escalao);
      await updateDoc(escalaoRef, {
        atletas: arrayUnion(captacao.nome)
      });

      // 3. Marcar captação como aprovada
      await updateDoc(doc(db, "captacoes", captacao.id), {
        aprovadoDirecao: "sim",
        dataAprovacao: new Date().toISOString(),
        estado: "aprovado",
        atletaCriado: atletaRef.id
      });

      alert("✅ Atleta criado com sucesso!");
      onClose();
      // Recarrega lista (chamado pelo hook)
      window.location.reload();
    } catch (err) {
      console.error("Erro ao aprovar:", err);
      alert("❌ Erro: " + err.message);
    }
  };

  // Função para rejeitar
  const rejeitarCaptacao = async () => {
    if (!confirm(`Rejeitar captação de "${captacao.nome}"?`)) return;

    try {
      await updateDoc(doc(db, "captacoes", captacao.id), {
        aprovadoDirecao: "nao",
        dataAprovacao: new Date().toISOString(),
        estado: "rejeitado"
      });
      alert("❌ Captação rejeitada");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Erro ao rejeitar:", err);
      alert("❌ Erro: " + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {captacao.nome?.charAt(0) || "?"}
              </div>
              <p className="text-sm opacity-90">
                {captacao.idade} anos • {captacao.escalao}
                {captacao.posicao && ` • ${captacao.posicao}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getBadgeInteresse(captacao.interesse)}`}>
              {captacao.interesse === "interessado" ? "✅ Interessado" :
                captacao.interesse === "neutro" ? "⏸️ Neutro" : "❌ Não interessado"}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getBadgeAprovacao(captacao.aprovadoDirecao)}`}>
              {captacao.aprovadoDirecao === "sim" ? "✓ Aprovado" :
                captacao.aprovadoDirecao === "nao" ? "✗ Rejeitado" : "⏳ Pendente"}
            </span>
            {captacao.criadoPor === "treinador" && captacao.criadoPorNome && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                <User className="w-3 h-3" />
                Criado por {captacao.criadoPorNome}
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-8">
          {/* Dados Básicos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded-full" />
              Informações do Atleta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Idade</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{captacao.idade} anos</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Escalão</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{captacao.escalao}</p>
              </div>

              {captacao.posicao && (
                <div className="bg-indigo-50 p-5 rounded-2xl border-2 border-indigo-200">
                  <p className="text-xs text-indigo-700 uppercase tracking-wide font-medium">Posição</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{captacao.posicao}</p>
                </div>
              )}
              {captacao.telemovel && (
                <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs text-emerald-700 uppercase tracking-wide font-medium">Telemóvel</p>
                  <p className="text-xl font-semibold text-slate-900 mt-1">{captacao.telemovel}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contacto */}
          {(captacao.email || captacao.encarregadoNome) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-green-500 rounded-full" />
                Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {captacao.email && (
                  <div className="bg-blue-50 p-5 rounded-2xl">
                    <p className="text-xs text-blue-700 font-medium">Email</p>
                    <p className="text-slate-900 font-semibold mt-1">{captacao.email}</p>
                  </div>
                )}
                {captacao.encarregadoNome && (
                  <div className="bg-amber-50 p-5 rounded-2xl border-r-4 border-amber-200">
                    <p className="text-xs text-amber-800 font-medium">Encarregado</p>
                    <p className="text-slate-900 font-semibold mt-1">{captacao.encarregadoNome}</p>
                    {captacao.encarregadoTelefone && (
                      <p className="text-sm text-slate-600 mt-1">📱 {captacao.encarregadoTelefone}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avaliação Treinador */}
          {(captacao.pontosPositivos || captacao.pontosNegativos || captacao.anosVoleibol || captacao.exClubes) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-purple-500 rounded-full" />
                Avaliação do Treinador
              </h3>
              <div className="space-y-4">
                {captacao.anosVoleibol && (
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-l-4 border-purple-400">
                    <p className="text-sm font-medium text-purple-900">🏐 Experiência</p>
                    <p className="text-xl font-semibold text-slate-900">{captacao.anosVoleibol}</p>
                  </div>
                )}
                {captacao.pontosPositivos && (
                  <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border-l-4 border-emerald-500">
                    <p className="text-sm font-semibold text-emerald-800 mb-2">✅ Pontos Positivos</p>
                    <p className="text-slate-700 leading-relaxed">{captacao.pontosPositivos}</p>
                  </div>
                )}
                {captacao.pontosNegativos && (
                  <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border-l-4 border-red-400">
                    <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Pontos a Melhorar</p>
                    <p className="text-slate-700 leading-relaxed">{captacao.pontosNegativos}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          {captacao.observacoes && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Observações Gerais</h4>
              <p className="text-slate-600 leading-relaxed">{captacao.observacoes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {/* Treinador: editar/apagar */}
            {isTreinador && (
              <>
                <button
                  onClick={onEditar(captacao)}
                  className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={onApagar}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </>
            )}

            {/* Direção: aprovar/rejeitar */}
            {isDirecao && (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                {isPendente ? (
                  <>
                    <button
                      onClick={aprovarEcriarAtleta}
                      className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={rejeitarCaptacao}
                      className="flex-1 sm:flex-none px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Rejeitar
                    </button>
                  </>
                ) : (
                  <div className="text-center py-2 px-4 bg-slate-100 rounded-lg text-slate-500 text-sm font-medium">
                    ✅ Decisão registada
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
