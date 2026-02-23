import { X } from 'lucide-react';

export default function ModalAcoes({ atleta, onClose, onRegistarAcao }) {
  const acoes = {
    ataque: [
      { label: 'Ponto', tipo: 'ataque_ponto', cor: 'bg-green-600 hover:bg-green-700' },
      { label: 'Continuidade', tipo: 'ataque_continuidade', cor: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'Erro', tipo: 'ataque_erro', cor: 'bg-red-600 hover:bg-red-700' },
    ],
    servico: [
      { label: 'Ace', tipo: 'servico_ace', cor: 'bg-yellow-600 hover:bg-yellow-700' },
      { label: 'Difícil', tipo: 'servico_dificil', cor: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'Fácil', tipo: 'servico_facil', cor: 'bg-gray-600 hover:bg-gray-700' },
      { label: 'Erro', tipo: 'servico_erro', cor: 'bg-red-600 hover:bg-red-700' },
    ],
    recepcao: [
      { label: 'Perfeita', tipo: 'recepcao_perfeita', cor: 'bg-green-600 hover:bg-green-700' },
      { label: 'Muito Boa', tipo: 'recepcao_muito_boa', cor: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'Boa', tipo: 'recepcao_boa', cor: 'bg-blue-500 hover:bg-blue-600' },
      { label: 'Má', tipo: 'recepcao_ma', cor: 'bg-orange-600 hover:bg-orange-700' },
      { label: 'Erro', tipo: 'recepcao_erro', cor: 'bg-red-600 hover:bg-red-700' },
    ],
    bloco: [
      { label: 'Ponto', tipo: 'bloco_ponto', cor: 'bg-green-600 hover:bg-green-700' },
      { label: 'Erro', tipo: 'bloco_erro', cor: 'bg-red-600 hover:bg-red-700' },
    ],
    defesa: [
      { label: 'Boa', tipo: 'defesa_boa', cor: 'bg-green-600 hover:bg-green-700' },
      { label: 'Tocou', tipo: 'defesa_tocou', cor: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'Erro', tipo: 'defesa_erro', cor: 'bg-red-600 hover:bg-red-700' },
    ],
  };

  const handleAcao = (tipo) => {
    onRegistarAcao(atleta.id, tipo);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{atleta.nome}</h2>
            <p className="text-sm text-gray-400">Seleciona a ação</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Ações */}
        <div className="space-y-6">
          {/* ATAQUE */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-green-400">🔥 Ataque</h3>
            <div className="grid grid-cols-3 gap-3">
              {acoes.ataque.map((acao) => (
                <button
                  key={acao.tipo}
                  onClick={() => handleAcao(acao.tipo)}
                  className={`${acao.cor} p-4 rounded-xl font-bold transition active:scale-95`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>

          {/* SERVIÇO */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-yellow-400">⚡ Serviço</h3>
            <div className="grid grid-cols-4 gap-3">
              {acoes.servico.map((acao) => (
                <button
                  key={acao.tipo}
                  onClick={() => handleAcao(acao.tipo)}
                  className={`${acao.cor} p-4 rounded-xl font-bold transition active:scale-95`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>

          {/* RECEÇÃO */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-blue-400">🎯 Receção</h3>
            <div className="grid grid-cols-3 gap-3">
              {acoes.recepcao.map((acao) => (
                <button
                  key={acao.tipo}
                  onClick={() => handleAcao(acao.tipo)}
                  className={`${acao.cor} p-3 rounded-xl font-bold text-sm transition active:scale-95`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>

          {/* BLOCO */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-red-400">🛡️ Bloco</h3>
            <div className="grid grid-cols-2 gap-3">
              {acoes.bloco.map((acao) => (
                <button
                  key={acao.tipo}
                  onClick={() => handleAcao(acao.tipo)}
                  className={`${acao.cor} p-4 rounded-xl font-bold transition active:scale-95`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>

          {/* DEFESA */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-purple-400">🎯 Defesa</h3>
            <div className="grid grid-cols-3 gap-3">
              {acoes.defesa.map((acao) => (
                <button
                  key={acao.tipo}
                  onClick={() => handleAcao(acao.tipo)}
                  className={`${acao.cor} p-4 rounded-xl font-bold transition active:scale-95`}
                >
                  {acao.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
