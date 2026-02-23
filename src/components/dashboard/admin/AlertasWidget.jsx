import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import AlertaDetalhesModal from './AlertaDetalhesModal';

export default function AlertasWidget({ alertas, loading, recarregarDashboard }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);

  const abrirModal = (alerta) => {
    setAlertaSelecionado(alerta);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAlertaSelecionado(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const todoAlertas = [
    ...alertas.criticos.map(a => ({ ...a, prioridade: 'critico' })),
    ...alertas.atencao.map(a => ({ ...a, prioridade: 'atencao' })),
    ...alertas.avisos.map(a => ({ ...a, prioridade: 'aviso' })),
    ...alertas.informativos.map(a => ({ ...a, prioridade: 'informativo' })),
  ];

  const totalAlertas = alertas.criticos.length + alertas.atencao.length + alertas.avisos.length;

  const getIconePorPrioridade = (prioridade) => {
    switch (prioridade) {
      case 'critico':
        return <AlertCircle className="w-5 h-5" />;
      case 'atencao':
        return <AlertTriangle className="w-5 h-5" />;
      case 'aviso':
        return <Info className="w-5 h-5" />;
      case 'informativo':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getEstilosPorPrioridade = (prioridade) => {
    switch (prioridade) {
      case 'critico':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          textColor: 'text-red-900',
          badge: 'bg-red-600',
        };
      case 'atencao':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-900',
          badge: 'bg-orange-600',
        };
      case 'aviso':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-900',
          badge: 'bg-yellow-600',
        };
      case 'informativo':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          textColor: 'text-green-900',
          badge: 'bg-green-600',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          textColor: 'text-slate-900',
          badge: 'bg-slate-600',
        };
    }
  };

  if (todoAlertas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Centro de Alertas</h3>
            <p className="text-sm text-slate-500">Nenhuma ação pendente</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-3">✅</div>
          <p className="text-slate-600 font-medium">Tudo em ordem!</p>
          <p className="text-sm text-slate-500 mt-1">Não há alertas neste momento</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Centro de Alertas</h3>
                <p className="text-sm text-slate-300">Requer atenção</p>
              </div>
            </div>
            {totalAlertas > 0 && (
              <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {totalAlertas}
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="p-6">
          <div className="space-y-3">
            {todoAlertas.map((alerta) => {
              const estilos = getEstilosPorPrioridade(alerta.prioridade);
              const icone = getIconePorPrioridade(alerta.prioridade);

              return (
                <div
                  key={alerta.id}
                  onClick={() => abrirModal(alerta)}
                  className={`${estilos.bg} ${estilos.border} border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone */}
                    <div className={`${estilos.iconBg} p-2 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <div className={estilos.iconColor}>{icone}</div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold text-sm ${estilos.textColor}`}>
                          {alerta.titulo}
                        </h4>
                        <span className={`${estilos.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0`}>
                          {alerta.contador}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mb-2">
                        {alerta.descricao}
                      </p>

                      {alerta.acao && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            → {alerta.acao}
                          </span>
                          <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                            (clique para ver detalhes)
                          </span>
                        </div>
                      )}

                      {/* Preview de dados (primeiros 3 itens) */}
                      {alerta.dados && alerta.dados.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/50">
                          <div className="space-y-1">
                            {alerta.dados.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="text-xs text-slate-600 flex items-center justify-between">
                                <span className="font-medium truncate">
                                  {item.atletaNome || item.nome || `Item ${idx + 1}`}
                                </span>
                                {item.diasAtraso && (
                                  <span className="text-red-600 font-semibold">
                                    {item.diasAtraso}d atraso
                                  </span>
                                )}
                                {item.diasEspera && (
                                  <span className="text-orange-600 font-semibold">
                                    {item.diasEspera}d espera
                                  </span>
                                )}
                                {item.taxaPresenca !== undefined && (
                                  <span className="text-orange-600 font-semibold">
                                    {item.taxaPresenca}% presença
                                  </span>
                                )}
                              </div>
                            ))}
                            {alerta.dados.length > 3 && (
                              <div className="text-xs text-slate-500 italic pt-1">
                                + {alerta.dados.length - 3} mais...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer com resumo */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {alertas.criticos.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="font-medium text-slate-700">{alertas.criticos.length} crítico{alertas.criticos.length !== 1 ? 's' : ''}</span>
                </span>
              )}
              {alertas.atencao.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="font-medium text-slate-700">{alertas.atencao.length} atenção</span>
                </span>
              )}
              {alertas.avisos.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span className="font-medium text-slate-700">{alertas.avisos.length} aviso{alertas.avisos.length !== 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
            <span className="text-slate-500">
              Clique nos alertas para tomar ação
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && alertaSelecionado && (
        <AlertaDetalhesModal
          alerta={alertaSelecionado}
          onClose={fecharModal}
          recarregarDashboard={recarregarDashboard}
        />
      )}
    </>
  );
}
