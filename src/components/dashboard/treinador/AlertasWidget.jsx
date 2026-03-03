import { AlertCircle, FileWarning, Calendar, DollarSign } from 'lucide-react';

export default function AlertasWidget({ equipas }) {
  // Exemplo de alertas (depois podes buscar do Firestore)
  const alertas = [
    {
      tipo: 'warning',
      icone: FileWarning,
      titulo: '3 atletas sem exame médico',
      descricao: 'Inês Fontes, Leonor Carvalho, Juliana Melo',
      cor: 'amber'
    },
    {
      tipo: 'info',
      icone: Calendar,
      titulo: 'Jogo na sexta-feira',
      descricao: 'Seniores F vs Leixões às 21:00',
      cor: 'blue'
    },
    {
      tipo: 'alert',
      icone: DollarSign,
      titulo: '5 atletas com quotas em atraso',
      descricao: 'Verificar situação financeira',
      cor: 'red'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold text-slate-900">Avisos Importantes</h3>
      </div>

      <div className="space-y-3">
        {alertas.map((alerta, idx) => {
          const Icone = alerta.icone;
          const cores = {
            amber: 'bg-amber-50 border-amber-200 text-amber-900',
            blue: 'bg-blue-50 border-blue-200 text-blue-900',
            red: 'bg-red-50 border-red-200 text-red-900',
          };

          return (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border ${cores[alerta.cor]}`}
            >
              <div className="flex items-start gap-3">
                <Icone className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alerta.cor === 'amber' ? 'text-amber-600' :
                  alerta.cor === 'blue' ? 'text-blue-600' :
                  'text-red-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">{alerta.titulo}</p>
                  <p className="text-xs opacity-80">{alerta.descricao}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
