import { Bell, Check, CheckCheck, X, AlertCircle, Info, Calendar, Package } from 'lucide-react';
import { useNotificacoes } from '../../hooks/useNotificacoes';
import { calcularTempo, getNivelPrioridade } from '../../utils/DashboardUtils';
import { useState } from 'react';

const NotificacoesWidget = ({ user }) => {
  const { notificacoes, naoLidas, loading, marcarComoLida, marcarTodasComoLidas } = useNotificacoes(user?.uid);
  const [expandido, setExpandido] = useState(false);

  const getIconeTipo = (tipo) => {
    const icones = {
      pagamento_atraso: AlertCircle,
      treino_cancelado: Calendar,
      equipamento_devolver: Package,
      novo_comunicado: Info,
      geral: Bell,
    };
    return icones[tipo] || Bell;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            {naoLidas > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {naoLidas > 9 ? '9+' : naoLidas}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notificações</h2>
            <p className="text-sm text-slate-500">
              {naoLidas} {naoLidas === 1 ? 'nova' : 'novas'}
            </p>
          </div>
        </div>

        {notificacoes.length > 0 && (
          <button
            onClick={marcarTodasComoLidas}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      {notificacoes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-1">Sem notificações</p>
          <p className="text-sm text-slate-500">Você está em dia com tudo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificacoes.slice(0, expandido ? notificacoes.length : 3).map((notif) => {
            const IconeTipo = getIconeTipo(notif.tipo);
            const prioridade = getNivelPrioridade(notif.prioridade || 'baixa');

            return (
              <div
                key={notif.id}
                className={`
                  p-3 rounded-lg border transition-all duration-200 cursor-pointer
                  ${notif.lida 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : `${prioridade.bg} ${prioridade.border}`
                  }
                  hover:shadow-sm
                `}
                onClick={() => !notif.lida && marcarComoLida(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${notif.lida ? 'bg-slate-200' : prioridade.bg}
                  `}>
                    <IconeTipo className={`w-4 h-4 ${notif.lida ? 'text-slate-500' : prioridade.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {notif.titulo}
                      </h4>
                      {!notif.lida && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                      {notif.mensagem}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {calcularTempo(notif.dataHora)}
                      </span>
                      {!notif.lida && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoLida(notif.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão Ver Mais */}
      {notificacoes.length > 3 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full mt-3 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
        >
          {expandido ? 'Ver menos' : `Ver mais (${notificacoes.length - 3})`}
        </button>
      )}
    </div>
  );
};

export default NotificacoesWidget;
