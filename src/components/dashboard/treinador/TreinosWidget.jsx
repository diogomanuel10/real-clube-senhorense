import { Calendar, Clock, MapPin, Users, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ModalDetalhes, ModalEditarTreino, ModalPlanoTreino } from '../../treinos/Modals';

export default function TreinosWidget({ treinosHoje, proximosTreinos, loading }) {
  const navigate = useNavigate();
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [showModalPlano, setShowModalPlano] = useState(false);      // ModalPlanoTreino
  const [showModalEditar, setShowModalEditar] = useState(false);    // ModalEditarTreino
  const [showModalPresencas, setShowModalPresencas] = useState(false); // ModalDetalhes
  const [showProximos, setShowProximos] = useState(false);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO + 'T00:00:00');
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${diasSemana[data.getDay()]} ${data.getDate()}/${data.getMonth() + 1}`;
  };

  const abrirPlano = (treino) => {
    setTreinoSelecionado(treino);
    setShowModalPlano(true);
  };

  const abrirPresencas = (treino) => {
    setTreinoSelecionado(treino);
    setShowModalPresencas(true);
  };

  const fecharModais = () => {
    setShowModalPlano(false);
    setShowModalEditar(false);
    setShowModalPresencas(false);
    setTreinoSelecionado(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Treinos</h3>
                <p className="text-xs text-slate-500">{treinosHoje.length} hoje</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/treinos')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 flex-shrink-0"
            >
              Ver calendário
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Treinos de Hoje */}
          {treinosHoje.length > 0 ? (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">HOJE</h4>
              <div className="space-y-3">
                {treinosHoje.map((treino) => (
                  <div
                    key={treino.id}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-bold text-slate-900 text-sm">{treino.equipa}</h5>
                      <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                        Hoje
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-medium">{treino.horaInicio} - {treino.horaFim}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs truncate">{treino.local || 'Local a definir'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => abrirPlano(treino)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-[#0b1635] font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Plano
                      </button>
                      <button
                        onClick={() => abrirPresencas(treino)}
                        className="px-3 py-2 bg-[#0b1635] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Presenças
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 mb-6">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Sem treinos hoje</p>
              <p className="text-xs text-slate-400 mt-1">Desfruta do dia de descanso!</p>
            </div>
          )}

          {/* Próximos treinos */}
          {proximosTreinos.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowProximos(prev => !prev)}
                className="text-sm text-slate-900 hover:text-slate-700 font-medium flex items-center gap-1"
              >
                {showProximos ? 'Ocultar próximos treinos' : `Mostrar próximos treinos (${proximosTreinos.length})`}
                <ChevronRight className={`w-4 h-4 transition-transform ${showProximos ? 'rotate-90' : ''}`} />
              </button>
            </div>
          )}

          {showProximos && proximosTreinos.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">PRÓXIMOS TREINOS</h4>
              <div className="space-y-2">
                {proximosTreinos.map((treino) => (
                  <div
                    key={treino.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => abrirPlano(treino)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-center flex-shrink-0 w-12">
                        <p className="text-xs font-semibold text-slate-500 uppercase">
                          {formatarData(treino.data).split(' ')[0]}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatarData(treino.data).split(' ')[1].split('/')[0]}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{treino.equipa}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {treino.horaInicio} · {treino.local || 'Local a definir'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão "Plano" → ver plano */}
      {showModalPlano && treinoSelecionado && (
        <ModalPlanoTreino
          treino={treinoSelecionado}
          onClose={fecharModais}
          onEditarClick={() => {
            setShowModalPlano(false);
            setShowModalEditar(true);
          }}
        />
      )}

      {showModalEditar && treinoSelecionado && (
        <ModalEditarTreino
          treino={treinoSelecionado}
          onClose={fecharModais}
          onSave={(novosDados) => {
            setTreinoSelecionado((prev) => ({ ...prev, ...novosDados })); // ← atualiza
            setShowModalEditar(false);
            setShowModalPlano(true); // ← volta ao ModalPlanoTreino já com dados novos
          }}
        />
      )}


      {/* Botão "Presenças" → marcar presenças */}
      {showModalPresencas && treinoSelecionado && (
        <ModalDetalhes
          treino={treinoSelecionado}
          onClose={fecharModais}
          onEditarClick={fecharModais}
        />
      )}
    </>
  );
}
