  // src/components/dashboard/fisio/LesoesAtivasWidget.jsx
  import { Activity, AlertTriangle, Clock } from 'lucide-react';
  import { useNavigate } from "react-router-dom";

  const CORES_GRAVIDADE = {
    leve: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    moderada: 'bg-amber-100 text-amber-700 border-amber-200',
    grave: 'bg-red-100 text-red-700 border-red-200',
  };

  export default function LesoesAtivasWidget({ lesoes, loading }) {

    const navigate = useNavigate();

    if (loading) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Lesões Ativas
              </h3>
              <p className="text-xs text-slate-500">
                {lesoes.length} atleta{lesoes.length !== 1 ? 's' : ''} em recuperação
              </p>
            </div>
          </div>

          {lesoes.length === 0 ? (
            <p className="text-sm text-slate-500">
              🎉 Nenhuma lesão ativa no momento!
            </p>
          ) : (
            <div className="space-y-3">
              {lesoes.map((lesao) => {
                const diasLesao = lesao.dataInicio
                  ? Math.round(
                      (new Date() - new Date(lesao.dataInicio)) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;

const corGravidade =
  CORES_GRAVIDADE[lesao.gravidade] || CORES_GRAVIDADE.leve;

const handleClick = () => {
  // aqui assumes que lesao.atletaId existe e é o id do doc em "atletas"
  navigate(`/atletas/${lesao.atletaId}`);
};


                return (
                  <div
                    key={lesao.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/30 transition-all"
                    onClick={handleClick}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {lesao.atletaNome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lesao.atletaEquipa}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${corGravidade}`}
                      >
                        {lesao.gravidade?.toUpperCase() || 'LEVE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-slate-700 font-medium">
                        {lesao.tipo || 'Lesão não especificada'}
                      </p>
                    </div>

                    {lesao.descricao && (
                      <p className="text-xs text-slate-600 mb-2">
                        {lesao.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Há {diasLesao} dias
                      </span>
                      {lesao.previsaoRetorno && (
                        <span>Retorno: {lesao.previsaoRetorno}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
