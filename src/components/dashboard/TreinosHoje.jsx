import { Clock, MapPin, Users, CalendarDays, ChevronRight } from 'lucide-react';
import { getTreinosHoje, formatarHoraTreino } from '../../utils/DashboardUtils';
import { useNavigate } from 'react-router-dom';

const TreinosHoje = ({ treinos, escaloes, loading }) => {
  const navigate = useNavigate();
  const treinosHoje = getTreinosHoje(treinos);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Treinos de Hoje</h2>
            <p className="text-sm text-slate-500">
              {treinosHoje.length} {treinosHoje.length === 1 ? 'treino marcado' : 'treinos marcados'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/treinos')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver calendário
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Lista de Treinos */}
      {treinosHoje.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-1">Sem treinos hoje</p>
          <p className="text-sm text-slate-500">Não existem treinos marcados para hoje</p>
        </div>
      ) : (
        <div className="space-y-3">
          {treinosHoje.map((treino) => {
            const escalao = escaloes.find(e => e.nome === treino.equipa);
            const cor = escalao?.cor || "from-slate-400 to-slate-500";

            return (
              <div
                key={treino.id}
                className={`
                  relative overflow-hidden rounded-xl border border-slate-200
                  bg-gradient-to-r ${cor} p-4
                  hover:shadow-md transition-all duration-200 cursor-pointer
                `}
                onClick={() => navigate('/treinos')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {treino.equipa}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {formatarHoraTreino(treino.horaInicio, treino.horaFim)}
                        </span>
                      </div>
                      
                      {treino.local && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{treino.local}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/treinos');
                      }}
                      className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Marcar Presenças
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TreinosHoje;
