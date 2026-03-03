import { Calendar } from 'lucide-react';

export default function CalendarioSemanalWidget() {
  const hoje = new Date();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Gera os 7 dias da semana atual
  const semana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - hoje.getDay() + i);
    return dia;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900">Esta Semana</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {semana.map((dia, i) => {
          const ehHoje = dia.toDateString() === hoje.toDateString();
          const temTreino = i === 1 || i === 3; // Exemplo: ter e qui têm treino

          return (
            <div
              key={i}
              className={`text-center p-2 rounded-lg transition ${
                ehHoje 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <p className={`text-[10px] font-medium mb-1 ${
                ehHoje ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {diasSemana[i]}
              </p>
              <p className="text-lg font-bold">
                {dia.getDate()}
              </p>
              {temTreino && (
                <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                  ehHoje ? 'bg-white' : 'bg-blue-600'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
