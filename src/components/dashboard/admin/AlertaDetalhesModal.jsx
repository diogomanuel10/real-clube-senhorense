import { useState } from 'react';
import { X, Check, Phone, Mail, AlertCircle, Clock, Trash2, Eye } from 'lucide-react';
import { useAlertasActions } from '../../../hooks/useAlertasActions';
import { useNavigate } from 'react-router-dom';

export default function AlertaDetalhesModal({ alerta, onClose, recarregarDashboard, onRemoverItem, onVerCaptacao }) {
  const navigate = useNavigate();  // ← ADICIONA
  const [processando, setProcessando] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  const {
    marcarQuotaPaga,
    aprovarCaptacao,
    rejeitarCaptacao,
    marcarAtletaContactado,
    enviarLembretePagamento,
    dispensarAlerta,
  } = useAlertasActions(recarregarDashboard);

  if (!alerta) return null;

  const handleAcao = async (acao, item) => {
    setProcessando(true);
    setItemSelecionado(item.id);

    let sucesso = false;

    try {
      switch (acao) {
        case 'ver-captacoes':
          window.location.href = `/captacoes?captacao=${item.id}`;
          onClose();
          return;
        case 'marcar-pago':
          sucesso = await marcarQuotaPaga(item.id);
          break;
        case 'aprovar-captacao':
          if (!window.confirm(`Aprovar "${item.nome}" e criar atleta no escalão ${item.escalao}?`)) {
            return;
          }
          sucesso = await aprovarCaptacao(item.id);
          break;
        case 'rejeitar-captacao':
          if (window.confirm('Tem certeza que deseja rejeitar esta captação?')) {
            sucesso = await rejeitarCaptacao(item.id);
          }
          break;
        case 'contactar-atleta':
          sucesso = await marcarAtletaContactado(item.id, alerta.tipo);
          break;
        case 'enviar-lembrete':
          sucesso = await enviarLembretePagamento(item.id);
          break;
        case 'dispensar':
          sucesso = await dispensarAlerta(alerta.tipo, item.id, 7);
          break;
        default:
          break;
      }

      // 👇 NOVO: Remove item localmente se sucesso
      if (sucesso) {
        onRemoverItem?.(item.id); // Remove do array local

        // Se era o último item, fecha o modal
        if (alerta.dados.length <= 1) {
          onClose();
        }
      }
    } finally {
      setProcessando(false);
      setItemSelecionado(null);
    }
  };

  const getAcoesPorTipo = (item) => {
    if (alerta.id === 'quotas-criticas' || alerta.id === 'quotas-moderadas' || alerta.id === 'quotas-leves') {
      return [
        {
          id: 'marcar-pago',
          label: 'Marcar como pago',
          icon: Check,
          cor: 'green',
        },
        {
          id: 'enviar-lembrete',
          label: 'Enviar lembrete',
          icon: Mail,
          cor: 'blue',
        },
      ];
    }

    if (alerta.id === 'captacoes-antigas' || alerta.id === 'captacoes-recentes') {
      return [
        {
          id: 'ver-captacoes',
          label: 'Ver Captação',
          icon: Eye,
          cor: 'blue',
        },
      ];
    }


    if (alerta.id === 'atletas-inativos' || alerta.id === 'assiduidade-baixa') {
      return [
        {
          id: 'contactar-atleta',
          label: 'Marcar como contactado',
          icon: Phone,
          cor: 'blue',
        },
      ];
    }

    return [];
  };

  const getBotaoCor = (cor) => {
    const cores = {
      green: 'bg-green-500 hover:bg-green-600 text-white',
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      red: 'bg-red-500 hover:bg-red-600 text-white',
      gray: 'bg-slate-300 hover:bg-slate-400 text-slate-700',
    };
    return cores[cor] || cores.gray;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{alerta.titulo}</h2>
            <p className="text-slate-300 text-sm mt-1">{alerta.descricao}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {alerta.dados && alerta.dados.length > 0 ? (
            <div className="space-y-4">
              {alerta.dados.map((item, idx) => {
                const acoes = getAcoesPorTipo(item);
                const estaProcessando = processando && itemSelecionado === item.id;

                return (
                  <div
                    key={item.id || idx}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    {/* Info do item */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {item.atletaNome || item.nome || `Item ${idx + 1}`}
                          </h3>
                          {item.equipa && (
                            <p className="text-sm text-slate-600 mt-1">
                              📍 {item.equipa}
                            </p>
                          )}
                          {item.escalao && (
                            <p className="text-sm text-slate-600 mt-1">
                              📍 {item.escalao}
                            </p>
                          )}
                        </div>

                        {/* Badges de status */}
                        <div className="flex flex-col gap-2 items-end">
                          {item.diasAtraso !== undefined && (
                            <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                              {item.diasAtraso} dias atraso
                            </span>
                          )}
                          {item.diasEspera !== undefined && (
                            <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full">
                              {item.diasEspera} dias espera
                            </span>
                          )}
                          {item.taxaPresenca !== undefined && (
                            <span className="bg-yellow-100 text-yellow-700 text-sm font-bold px-3 py-1 rounded-full">
                              {item.taxaPresenca}% presença
                            </span>
                          )}
                          {item.valor !== undefined && (
                            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                              {item.valor}€
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info adicional */}
                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        {item.dataVencimento && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>Vencimento: {new Date(item.dataVencimento).toLocaleDateString('pt-PT')}</span>
                          </div>
                        )}
                        {item.telemovel && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4" />
                            <span>{item.telemovel}</span>
                          </div>
                        )}
                        {item.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            <span>{item.email}</span>
                          </div>
                        )}
                        {item.faltasInjustificadas !== undefined && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>{item.faltasInjustificadas} faltas injustificadas</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    {acoes.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                        {acoes.map((acao) => {
                          const Icone = acao.icon;
                          return (
                            <button
                              key={acao.id}
                              onClick={() => handleAcao(acao.id, item)}
                              disabled={estaProcessando}
                              className={`
                                ${getBotaoCor(acao.cor)}
                                px-4 py-2 rounded-lg text-sm font-medium
                                flex items-center gap-2 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                              `}
                            >
                              <Icone className="w-4 h-4" />
                              {estaProcessando ? 'Processando...' : acao.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Nenhum item para mostrar
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Total: <span className="font-semibold">{alerta.dados?.length || 0}</span> {alerta.dados?.length === 1 ? 'item' : 'itens'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
