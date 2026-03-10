import { X } from "lucide-react";

export default function CaptacaoFormModal({
  open,
  onClose,
  form,
  setForm,
  modoEdicao,
  escaloes,
  permissions,
  onSubmit
}) {
  if (!open) return null;

  const isTreinador = permissions.isTreinador;
  const isDirecao = !isTreinador;

  // Só o treinador pode editar ou apagar
  const canEdit = isTreinador;
  const canDelete = isTreinador;

  // Admin/Direção só lê
  const isReadonly = isDirecao;

  const handleChange = (field) => (e) => {
    if (isReadonly) return; // Bloqueia mudanças se readonly
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {modoEdicao ? "Editar Captação" : "Nova Captação"}
              </h2>
              {isReadonly && (
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  👤 Visualização - Apenas direção pode aprovar
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 -m-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isReadonly
              ? "Dados preenchidos pelo treinador. Direção pode aprovar/rejeitar."
              : "Preenche os dados do atleta para avaliação"
            }
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Informações Básicas - READONLY para direção em edição */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded" />
              Informações Básicas {isReadonly && <span className="text-xs text-slate-400">(preenchido pelo treinador)</span>}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={handleChange('nome')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  required={!isReadonly}
                  placeholder="Nome do atleta"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Idade *
                </label>
                <input
                  type="number"
                  value={form.idade}
                  onChange={handleChange('idade')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  required={!isReadonly}
                  placeholder="16"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Escalão Pretendido *
              </label>
              <select
                value={form.escalao}
                onChange={handleChange('escalao')}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                  : 'border-slate-300 hover:border-slate-400'
                  }`}
                readOnly={isReadonly}
                required={!isReadonly}
                disabled={isReadonly || (isTreinador && permissions.equipas.length === 1)}
              >
                <option value="">Selecionar escalão</option>
                {escaloes.map((esc) => (
                  <option key={esc.id} value={esc.nome}>
                    {esc.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Posição *
              </label>
              <select
                value={form.posicao}
                onChange={handleChange('posicao')}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                  : 'border-slate-300 hover:border-slate-400'
                  }`}
                readOnly={isReadonly}
                required={!isReadonly}
              >
                <option value="">Selecionar posição</option>
                <option value="L">Líbero</option>
                <option value="OP">Oposto</option>
                <option value="AV">Ponta</option>
                <option value="MD">Central</option>
                <option value="LS">Distribuidor(a)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Telemóvel
                </label>
                <input
                  type="tel"
                  value={form.telemovel}
                  onChange={handleChange('telemovel')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  placeholder="912 345 678"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                    : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  placeholder="atleta@email.com"
                />
              </div>
            </div>

            {/* Encarregado */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded" />
                Encarregado de Educação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={form.encarregadoNome}
                    onChange={handleChange('encarregadoNome')}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                      : 'border-slate-300 hover:border-slate-400'
                      }`}
                    readOnly={isReadonly}
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={form.encarregadoTelefone}
                    onChange={handleChange('encarregadoTelefone')}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly
                      ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500'
                      : 'border-slate-300 hover:border-slate-400'
                      }`}
                    readOnly={isReadonly}
                    placeholder="912 345 678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Histórico e Avaliação - MESMO READONLY */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-green-500 rounded" />
              Histórico e Avaliação do Treinador {isReadonly && <span className="text-xs text-slate-400">(preenchido pelo treinador)</span>}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ex-Clubes</label>
                <input
                  type="text"
                  value={form.exClubes}
                  onChange={handleChange('exClubes')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  placeholder="Ex: Sporting CP, FC Porto"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Anos de Voleibol</label>
                <input
                  type="text"
                  value={form.anosVoleibol}
                  onChange={handleChange('anosVoleibol')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  readOnly={isReadonly}
                  placeholder="Ex: 3 anos"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pontos Positivos</label>
                <textarea
                  value={form.pontosPositivos}
                  onChange={handleChange('pontosPositivos')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 resize-vertical ${isReadonly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500 h-24' : 'border-slate-300 hover:border-slate-400 h-24'
                    }`}
                  readOnly={isReadonly}
                  placeholder="Ex: Boa técnica de manchete, altura acima da média..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pontos Negativos</label>
                <textarea
                  value={form.pontosNegativos}
                  onChange={handleChange('pontosNegativos')}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 resize-vertical ${isReadonly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500 h-24' : 'border-slate-300 hover:border-slate-400 h-24'
                    }`}
                  readOnly={isReadonly}
                  placeholder="Ex: Pouca força no ataque, precisa melhorar defesa..."
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Interesse do Treinador</label>
              <select
                value={form.interesse}
                onChange={handleChange('interesse')}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] transition-all duration-200 ${isReadonly ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500' : 'border-slate-300 hover:border-slate-400'
                  }`}
                readOnly={isReadonly}
              >
                <option value="interessado">✅ Interessado</option>
                <option value="neutro">⏸️ Neutro</option>
                <option value="nao-interessado">❌ Não Interessado</option>
              </select>
            </div>
          </div>

          {/* APROVAÇÃO DIREÇÃO - SÓ DIREÇÃO EDITA */}
          {!isReadonly && isDirecao && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-500 rounded" />
                Aprovação da Direção
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">Estado da Aprovação</label>
                <select
                  value={form.aprovadoDirecao}
                  onChange={handleChange('aprovadoDirecao')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#f5c623] bg-gradient-to-r from-emerald-50 to-blue-50 font-semibold"
                  disabled={false} // Direção sempre pode editar este campo
                >
                  <option value="pendente">⏳ Pendente</option>
                  <option value="sim">✅ Aprovado</option>
                  <option value="nao">❌ Rejeitado</option>
                </select>
                {isTreinador && (
                  <p className="text-xs text-slate-500 mt-2">
                    ℹ️ Apenas a direção pode aprovar/rejeitar captações
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t bg-slate-50/50 px-4 py-4 rounded-b-2xl -mx-6 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
            >
              {isReadonly ? "Fechar" : "Cancelar"}
            </button>

            {canEdit && (
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#0b1635] text-white rounded-xl font-semibold hover:bg-[#152452] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {modoEdicao ? "Guardar Alterações" : "Adicionar Captação"}
              </button>
            )}

            {canDelete && modoEdicao && (
              <button
                type="button"
                onClick={() => onDelete(form.id)}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-200"
              >
                Apagar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
