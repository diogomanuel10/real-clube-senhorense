import ComunicadoCard from './ComunicadoCard';
import { Pin } from 'lucide-react';

const ComunicadosFeed = ({ 
  comunicados, 
  onView, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  canEdit,
  loading 
}) => {
  // Separar fixados dos normais
  const fixados = comunicados.filter(c => c.pinned);
  const normais = comunicados.filter(c => !c.pinned);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-48 bg-slate-200 rounded mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (comunicados.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Pin className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          Ainda não há comunicados
        </h3>
        <p className="text-slate-600 mb-6">
          Seja o primeiro a publicar um comunicado para o clube
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comunicados Fixados */}
      {fixados.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-600 font-semibold">
            <Pin className="w-5 h-5" />
            <span>Comunicados Fixados</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fixados.map(comunicado => (
              <ComunicadoCard
                key={comunicado.id}
                comunicado={comunicado}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Comunicados Normais */}
      {normais.length > 0 && (
        <div className="space-y-4">
          {fixados.length > 0 && (
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <span>Todos os Comunicados</span>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {normais.map(comunicado => (
              <ComunicadoCard
                key={comunicado.id}
                comunicado={comunicado}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
                canEdit={canEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComunicadosFeed;
