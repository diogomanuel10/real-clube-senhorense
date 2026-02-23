import { Plus, Minus, AlertTriangle } from 'lucide-react';

export default function BotoesGerais({ 
  onErroEquipa, 
  onErroAdversario, 
  onPontoAdversario 
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="font-bold text-lg mb-4 text-purple-400">⚙️ Ações Gerais</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Erro da Nossa Equipa */}
        <button
          onClick={onErroEquipa}
          className="bg-red-600 hover:bg-red-700 p-6 rounded-xl transition active:scale-95"
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm font-bold">Erro</div>
          <div className="text-xs opacity-75">Nossa Equipa</div>
        </button>

        {/* Erro do Adversário */}
        <button
          onClick={onErroAdversario}
          className="bg-green-600 hover:bg-green-700 p-6 rounded-xl transition active:scale-95"
        >
          <Plus className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm font-bold">Erro</div>
          <div className="text-xs opacity-75">Adversário</div>
        </button>

        {/* Ponto Adversário */}
        <button
          onClick={onPontoAdversario}
          className="bg-orange-600 hover:bg-orange-700 p-6 rounded-xl transition active:scale-95"
        >
          <Minus className="w-8 h-8 mx-auto mb-2" />
          <div className="text-sm font-bold">Ponto</div>
          <div className="text-xs opacity-75">Adversário</div>
        </button>
      </div>
    </div>
  );
}
