import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { MESES, DIAS_SEMANA_CURTOS } from '../../constants/treinos';
import { getDiasDoMes, agruparTreinosPorDia, isHoje } from '../../utils/CalendarioUtils';

const Calendario = ({ 
  ano, 
  mes, 
  treinos, 
  escaloes, 
  loading, 
  onMudarMes, 
  onTreinoClick 
}) => {
  const dias = getDiasDoMes(ano, mes);
  const treinosPorDia = agruparTreinosPorDia(treinos, ano, mes);

  const mudarMes = (delta) => {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    onMudarMes(novoAno, novoMes);
  };

  return (
    <>
      {/* Navegação de mês */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <button
          onClick={() => mudarMes(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg md:text-xl font-bold text-slate-900">
          {MESES[mes]} {ano}
        </h2>
        
        <button
          onClick={() => mudarMes(1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Legenda */}
      <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-slate-600 font-medium">Dia Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600 font-medium">Com Treinos</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-slate-600" />
            <span className="text-slate-600 font-medium">Clique para ver presenças</span>
          </div>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        {/* Header dos dias */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          {DIAS_SEMANA_CURTOS.map((dia, idx) => (
            <div
              key={idx}
              className="text-center py-3 text-xs font-bold uppercase tracking-wide border-r border-white/10 last:border-r-0"
            >
              {dia}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-600 font-medium">A carregar treinos...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-slate-200">
            {dias.map((date, idx) => {
              if (!date) {
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/30 border-b border-slate-100 min-h-[100px]"
                  />
                );
              }

              const dia = date.getDate();
              const hoje = isHoje(date);
              const treinosDia = treinosPorDia[dia] || [];
              const temTreinos = treinosDia.length > 0;

              return (
                <div
                  key={idx}
                  className={`
                    min-h-[100px] border-b border-slate-200
                    transition-all duration-150
                    ${hoje ? "bg-blue-50/50" : "bg-white hover:bg-slate-50"}
                  `}
                >
                  {/* Header do dia */}
                  <div className={`
                    px-2 py-1.5 flex items-center justify-between
                    ${hoje ? "bg-blue-600" : "bg-slate-100"}
                  `}>
                    <span className={`
                      text-sm font-bold
                      ${hoje ? "text-white" : "text-slate-700"}
                    `}>
                      {dia}
                    </span>
                    {temTreinos && (
                      <span className={`
                        flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                        ${hoje ? "bg-white text-blue-600" : "bg-emerald-500 text-white"}
                      `}>
                        {treinosDia.length}
                      </span>
                    )}
                  </div>

                  {/* Treinos */}
                  <div className="p-1.5 space-y-1">
                    {treinosDia.length === 0 ? (
                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400">—</span>
                      </div>
                    ) : (
                      treinosDia.map((t) => {
                        const esc = escaloes.find((e) => e.nome === t.equipa);
                        const cor = esc?.cor || "from-slate-400 to-slate-500";

                        return (
                          <button
                            key={t.id}
                            onClick={() => onTreinoClick(t)}
                            className={`
                              w-full text-left px-2 py-1.5 rounded-md
                              bg-gradient-to-r ${cor}
                              shadow-sm hover:shadow-md
                              transition-all duration-200
                              hover:scale-[1.02]
                              cursor-pointer group
                              border border-slate-300/30
                            `}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] font-bold text-slate-900 truncate pr-1">
                                {t.equipa}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-700 font-semibold">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{t.horaInicio}–{t.horaFim}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Calendario;
