import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
import AlertaDetalhesModal from './AlertaDetalhesModal';

export default function AlertasWidget({ alertas: alertasOriginais, loading, recarregarDashboard }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);
  const [alertasLocais, setAlertasLocais] = useState(null);
 
  useEffect(() => {
    setAlertasLocais(alertasOriginais);
  }, [alertasOriginais]);

  const getIcone = (prioridade) => {
    switch (prioridade) {
      case 'critico': return <AlertCircle className="w-5 h-5" />;
      case 'atencao': return <AlertTriangle className="w-5 h-5" />;
      case 'aviso': return <Info className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const abrirAlerta = (alerta) => {
    setAlertaSelecionado(alerta);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setAlertaSelecionado(null);
  };

  const removerItemAlerta = (itemId) => {
    if (!alertaSelecionado) return;

    // Atualiza o alerta selecionado (para o modal ver a mudança)
    const alertaAtualizado = {
      ...alertaSelecionado,
      dados: alertaSelecionado.dados.filter(item => item.id !== itemId),
      contador: alertaSelecionado.contador - 1,
    };

    setAlertaSelecionado(alertaAtualizado);

    // Atualiza o estado local dos alertas
    setAlertasLocais(prev => {
      if (!prev) return prev;
      
      const atualizarGrupo = (grupo) => {
        return grupo.map(a =>
          a.id === alertaSelecionado.id
            ? { ...a, dados: a.dados.filter(item => item.id !== itemId), contador: a.contador - 1 }
            : a
        ).filter(a => a.dados.length > 0); // Remove alertas vazios
      };

      return {
        criticos: atualizarGrupo(prev.criticos || []),
        atencao: atualizarGrupo(prev.atencao || []),
        avisos: atualizarGrupo(prev.avisos || []),
        informativos: prev.informativos || [],
      };
    });

    // Fecha modal se era o último item
    if (alertaAtualizado.dados.length === 0) {
      fecharModal();
    }

    // Recarrega em background para sincronizar com BD
    setTimeout(() => recarregarDashboard(), 500);
  };

  const getEstilos = (prioridade) => ({
    critico: { bg: 'bg-red-50 border-red-200', icon: 'text-red-600 bg-red-100' },
    atencao: { bg: 'bg-orange-50 border-orange-200', icon: 'text-orange-600 bg-orange-100' },
    aviso: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-600 bg-yellow-100' }
  }[prioridade] || { bg: 'bg-slate-50 border-slate-200', icon: 'text-slate-600 bg-slate-100' });

  // 👇 Loading ou sem dados
  if (loading || !alertasLocais) {
    return <div className="animate-pulse bg-white rounded-xl border p-6 h-64" />;
  }

  // 👇 Garantir estrutura segura
  const alertasSeguro = {
    criticos: alertasLocais?.criticos || [],
    atencao: alertasLocais?.atencao || [],
    avisos: alertasLocais?.avisos || [],
    informativos: alertasLocais?.informativos || [],
  };

  const todoAlertas = [
    ...alertasSeguro.criticos.map(a => ({ ...a, prioridade: 'critico', score: 4 })),
    ...alertasSeguro.atencao.map(a => ({ ...a, prioridade: 'atencao', score: 3 })),
    ...alertasSeguro.avisos.map(a => ({ ...a, prioridade: 'aviso', score: 2 })),
  ].sort((a, b) => b.score - a.score);

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">Alertas Importantes</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              todoAlertas.length ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'
            }`}>
              {todoAlertas.length}
            </span>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {todoAlertas.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">✅</div>
              <p className="text-slate-600 font-medium">Tudo em ordem!</p>
              <p className="text-sm text-slate-500 mt-1">Não há alertas neste momento</p>
            </div>
          ) : (
            todoAlertas.slice(0, 6).map((alerta) => {
              const estilos = getEstilos(alerta.prioridade);
              
              return (
                <div
                  key={alerta.id}
                  className={`${estilos.bg} border rounded-xl p-4 mb-3 hover:shadow-lg cursor-pointer transition-all`}
                  onClick={() => abrirAlerta(alerta)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${estilos.icon}`}>
                      {getIcone(alerta.prioridade)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-bold text-sm ${alerta.prioridade === 'critico' ? 'text-red-900' : 'text-slate-900'}`}>
                          {alerta.titulo}
                        </h4>
                        <span className={`px-2 py-px rounded-full text-xs font-bold ${
                          alerta.prioridade === 'critico' ? 'bg-red-600 text-white' :
                          'bg-slate-600 text-white'
                        }`}>
                          {alerta.contador}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-700 mb-2">
                        {alerta.descricao}
                      </p>

                      <div className="flex items-center pt-1 border-t border-slate-200/50">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Resolver agora
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              {todoAlertas.length > 0 ? 'Ordenado por urgência' : 'Dashboard atualizado'}
            </span>
            <button 
              onClick={recarregarDashboard} 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {modalAberto && alertaSelecionado && (
        <AlertaDetalhesModal
          alerta={alertaSelecionado}
          onClose={fecharModal}
          recarregarDashboard={recarregarDashboard}
          onRemoverItem={removerItemAlerta}
        />
      )}
    </>
  );
}
