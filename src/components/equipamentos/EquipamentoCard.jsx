import { 
  Edit, 
  Trash2, 
  UserPlus, 
  RotateCcw, 
  Wrench,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EquipamentoCard = ({ 
  equipamento, 
  emprestimo, 
  viewMode, 
  onEditar, 
  onEmprestar, 
  onDevolver, 
  onManutencao, 
  onEliminar,
  userRole 
}) => {
  const isAdmin = userRole === 'admin' || userRole === 'diretor';

  const getEstadoColor = (estado) => {
    const colors = {
      disponivel: 'bg-green-100 text-green-800 border-green-200',
      em_uso: 'bg-blue-100 text-blue-800 border-blue-200',
      manutencao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      danificado: 'bg-red-100 text-red-800 border-red-200',
      perdido: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[estado] || colors.disponivel;
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      disponivel: 'Disponível',
      em_uso: 'Em Uso',
      manutencao: 'Manutenção',
      danificado: 'Danificado',
      perdido: 'Perdido'
    };
    return labels[estado] || estado;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4">
          {/* Info Principal */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{equipamento.nome}</h3>
                {equipamento.codigo && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {equipamento.codigo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {equipamento.categoria}
                </span>
                {equipamento.localizacao && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {equipamento.localizacao}
                  </span>
                )}
                {equipamento.quantidade && (
                  <span>Qtd: {equipamento.quantidade}</span>
                )}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(equipamento.estado)}`}>
              {getEstadoLabel(equipamento.estado)}
            </span>
          </div>

          {/* Valor */}
          {equipamento.valor && (
            <div className="flex-shrink-0 text-right">
              <p className="text-sm text-gray-600">Valor</p>
              <p className="font-semibold text-gray-900">
                {equipamento.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          )}

          {/* Empréstimo Info */}
          {emprestimo && (
            <div className="flex-shrink-0 bg-blue-50 px-3 py-2 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Emprestado a</p>
              <p className="text-sm font-semibold text-blue-900">{emprestimo.nomeAtleta}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {equipamento.estado === 'disponivel' && isAdmin && (
              <button
                onClick={() => onEmprestar(equipamento)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Emprestar"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}

            {equipamento.estado === 'em_uso' && isAdmin && (
              <button
                onClick={() => onDevolver(equipamento.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Devolver"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => onManutencao(equipamento)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Manutenção"
                >
                  <Wrench className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onEditar(equipamento)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onEliminar(equipamento.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Header com Imagem/Ícone */}
      <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
        {equipamento.imagemUrl ? (
          <img 
            src={equipamento.imagemUrl} 
            alt={equipamento.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-16 h-16 text-white" />
        )}
        
        {/* Badge de Estado */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${getEstadoColor(equipamento.estado)}`}>
            {getEstadoLabel(equipamento.estado)}
          </span>
        </div>

        {/* Código */}
        {equipamento.codigo && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-mono px-2 py-1 rounded">
              {equipamento.codigo}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Nome e Categoria */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
            {equipamento.nome}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
              {equipamento.categoria}
            </span>
            {equipamento.quantidade && (
              <span className="text-xs">Qtd: {equipamento.quantidade}</span>
            )}
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2 mb-4">
          {equipamento.localizacao && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{equipamento.localizacao}</span>
            </div>
          )}

          {equipamento.valor && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">
                {equipamento.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          )}

          {equipamento.dataCompra && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(equipamento.dataCompra), 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Info Empréstimo */}
        {emprestimo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 font-medium mb-1">Emprestado a</p>
            <p className="text-sm font-semibold text-blue-900">{emprestimo.nomeAtleta}</p>
            <p className="text-xs text-blue-600 mt-1">
              Desde {format(new Date(emprestimo.dataEmprestimo), 'dd/MM/yyyy')}
            </p>
          </div>
        )}

        {/* Alertas */}
        {equipamento.estado === 'danificado' && equipamento.observacoes && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{equipamento.observacoes}</p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center gap-2">
          {equipamento.estado === 'disponivel' && isAdmin && (
            <button
              onClick={() => onEmprestar(equipamento)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Emprestar
            </button>
          )}

          {equipamento.estado === 'em_uso' && isAdmin && (
            <button
              onClick={() => onDevolver(equipamento.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Devolver
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => onManutencao(equipamento)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-yellow-200"
                title="Manutenção"
              >
                <Wrench className="w-5 h-5" />
              </button>

              <button
                onClick={() => onEditar(equipamento)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => onEliminar(equipamento.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipamentoCard;
