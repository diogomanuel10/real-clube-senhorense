import { Megaphone, ChevronRight, Calendar, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategoriaConfig, getCategoriaColors } from '../../constants/comunicados';

const ComunicadosWidget = ({ comunicados, loading }) => {
  const navigate = useNavigate();

  // Pegar os 3 mais recentes
  const comunicadosRecentes = comunicados
    .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
    .slice(0, 3);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    }
    if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    }
    
    return data.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="h-48 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Comunicados</h2>
            <p className="text-sm text-slate-500">Últimas novidades</p>
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

      {/* Lista de Comunicados */}
      {comunicadosRecentes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-1">Sem comunicados</p>
          <p className="text-sm text-slate-500">Ainda não há comunicados publicados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comunicadosRecentes.map((comunicado) => {
            const categoriaConfig = getCategoriaConfig(comunicado.categoria);
            const colors = getCategoriaColors(comunicado.categoria);

            return (
              <div
                key={comunicado.id}
                onClick={() => navigate('/comunicados')}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  hover:shadow-md ${colors.bg} ${colors.border}
                `}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {comunicado.pinned && (
                        <Pin className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {comunicado.titulo}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {comunicado.resumo || comunicado.conteudo}
                    </p>
                  </div>
                  
                  <span className={`
                    px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0
                    ${colors.badge}
                  `}>
                    {categoriaConfig.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatarData(comunicado.dataCriacao)}</span>
                  </div>
                  <span className="font-medium">{comunicado.autor}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComunicadosWidget;
