import { Edit, Plus, Minus } from 'lucide-react';

export default function Placar({ jogo, resultado, onEditarResultado, onAtualizarPontos }) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 relative">
      {/* Botão de edição manual */}
      <button
        onClick={onEditarResultado}
        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white z-10"
        title="Editar resultado manualmente"
      >
        <Edit className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-8">
        {/* NOSSA EQUIPA */}
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400 mb-2">{jogo.equipa}</p>
          
          {/* Score */}
          <p className="text-5xl font-bold text-blue-400 mb-3">
            {resultado.nos}
          </p>
          
          {/* Botões +1 / -1 */}
          <div className="flex gap-2">
            <button
              onClick={() => onAtualizarPontos('nos', -1)}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition active:scale-95 flex items-center justify-center gap-1 font-bold text-sm"
            >
              <Minus className="w-4 h-4" />
              -1
            </button>
            
            <button
              onClick={() => onAtualizarPontos('nos', 1)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition active:scale-95 flex items-center justify-center gap-1 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              +1
            </button>
          </div>
        </div>

        {/* VS */}
        <div className="text-2xl text-gray-500 font-bold">vs</div>

        {/* ADVERSÁRIO */}
        <div className="text-center flex-1">
          <p className="text-xs text-gray-400 mb-2">{jogo.adversario}</p>
          
          {/* Score */}
          <p className="text-5xl font-bold text-red-400 mb-3">
            {resultado.adversario}
          </p>
          
          {/* Botões +1 / -1 */}
          <div className="flex gap-2">
            <button
              onClick={() => onAtualizarPontos('adversario', -1)}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition active:scale-95 flex items-center justify-center gap-1 font-bold text-sm"
            >
              <Minus className="w-4 h-4" />
              -1
            </button>
            
            <button
              onClick={() => onAtualizarPontos('adversario', 1)}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition active:scale-95 flex items-center justify-center gap-1 font-bold text-sm"
            >
              <Plus className="w-4 h-4" />
              +1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
