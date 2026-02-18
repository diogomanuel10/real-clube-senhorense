import { Megaphone, ChevronRight, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComunicadosWidgetTreinador({ comunicados, loading }) {
  const navigate = useNavigate();

  const formatarData = (timestamp) => {
    if (!timestamp) return '';
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hoje = new Date();
    const diff = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff < 7) return `Há ${diff} dias`;
    return data.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
  };

  const getCategoriaColor = (categoria) => {
    const cores = {
      aviso: 'bg-red-100 text-red-700 border-red-200',
      informacao: 'bg-blue-100 text-blue-700 border-blue-200',
      evento: 'bg-purple-100 text-purple-700 border-purple-200',
      conquista: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return cores[categoria] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Comunicados</h3>
            <p className="text-xs text-slate-500">Últimas novidades</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/comunicados')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        {comunicados.length > 0 ? (
          <div className="space-y-3">
            {comunicados.map((comunicado) => (
              <div
                key={comunicado.id}
                onClick={() => navigate('/comunicados')}
                className="group p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                {/* Header do comunicado */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {comunicado.fixado && (
                      <Pin className="w-4 h-4 text-blue-600 fill-blue-600" />
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoriaColor(comunicado.categoria)}`}>
                      {comunicado.categoria || 'Informação'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatarData(comunicado.criadoEm)}
                  </span>
                </div>

                {/* Título */}
                <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {comunicado.titulo}
                </h4>

                {/* Resumo */}
                {comunicado.resumo && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                    {comunicado.resumo}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>👁️ {comunicado.visualizacoes || 0} visualizações</span>
                  {comunicado.destinatarios && comunicado.destinatarios.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      📢 {comunicado.destinatarios.includes('todos') 
                        ? 'Todos' 
                        : comunicado.destinatarios.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Sem comunicados recentes</p>
            <p className="text-xs text-slate-400 mt-1">Novidades aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
