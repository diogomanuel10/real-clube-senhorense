import { Eye, Calendar, User, Pin, Edit, Trash2, Tag } from 'lucide-react';
import { getCategoriaConfig, getCategoriaColors } from '../../constants/comunicados';

const ComunicadoCard = ({ 
  comunicado, 
  onView, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  canEdit 
}) => {
  const categoriaConfig = getCategoriaConfig(comunicado.categoria);
  const colors = getCategoriaColors(comunicado.categoria);

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div 
      className={`
        relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200
        hover:shadow-md cursor-pointer overflow-hidden
        ${comunicado.pinned ? 'border-yellow-400 bg-yellow-50/30' : 'border-slate-200'}
      `}
    >
      {/* Pin Badge */}
      {comunicado.pinned && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm z-10">
          <Pin className="w-3 h-3" />
          Fixado
        </div>
      )}

      {/* Imagem de Capa (se existir) */}
      {comunicado.imagemUrl && (
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${comunicado.imagemUrl})` }}
          onClick={() => onView(comunicado)}
        />
      )}

      {/* Conteúdo */}
      <div className="p-5" onClick={() => onView(comunicado)}>
        {/* Categoria Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold border
            ${colors.badge}
          `}>
            {categoriaConfig.label}
          </span>
          
          {comunicado.tags && comunicado.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {comunicado.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {comunicado.tags.length > 2 && (
                <span className="text-xs text-slate-500">
                  +{comunicado.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
          {comunicado.titulo}
        </h3>

        {/* Resumo */}
        {comunicado.resumo && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
            {comunicado.resumo}
          </p>
        )}

        {/* Escalões (se específico) */}
        {comunicado.escaloes && comunicado.escaloes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Tag className="w-3 h-3" />
              <span className="font-medium">Para:</span>
              <div className="flex flex-wrap gap-1">
                {comunicado.escaloes.slice(0, 3).map((escalao, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {escalao}
                  </span>
                ))}
                {comunicado.escaloes.length > 3 && (
                  <span className="text-slate-500">+{comunicado.escaloes.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{comunicado.autor}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatarData(comunicado.dataCriacao)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{comunicado.visualizacoes || 0}</span>
            </div>
          </div>

          {/* Ações (apenas para admins) */}
          {canEdit && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(comunicado.id, comunicado.pinned);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  comunicado.pinned 
                    ? 'text-yellow-600 hover:bg-yellow-50' 
                    : 'text-slate-400 hover:bg-slate-100'
                }`}
                title={comunicado.pinned ? 'Desafixar' : 'Fixar no topo'}
              >
                <Pin className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(comunicado);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(comunicado.id);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComunicadoCard;
