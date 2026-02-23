export default function CardAtleta({ atleta, stats, onClick }) {
  const atletaStats = stats[atleta.id];

  return (
    <button
      onClick={() => onClick(atleta)}
      className="w-full bg-gray-800 hover:bg-gray-750 rounded-xl p-4 transition-all active:scale-98 text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{atleta.nome}</h3>
          <div className="text-sm text-gray-400 mt-1">
            {atletaStats.pontos} pts • {atletaStats.aces} aces •{' '}
            {atletaStats.bloqueios} bloq • {atletaStats.defesas} def
          </div>
          {atletaStats.erros > 0 && (
            <div className="text-xs text-red-400 mt-1">
              ❌ {atletaStats.erros} erros
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-400">
            {atletaStats.pontos}
          </div>
          <div className="text-xs text-gray-500">pontos</div>
        </div>
      </div>

      {/* Mini resumo */}
      <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
        <div className="bg-gray-700 rounded p-2">
          <div className="font-bold text-yellow-400">{atletaStats.aces}</div>
          <div className="text-gray-400">Aces</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="font-bold text-green-400">{atletaStats.ataquesEficazes}</div>
          <div className="text-gray-400">Ataques</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="font-bold text-red-400">{atletaStats.bloqueios}</div>
          <div className="text-gray-400">Blocos</div>
        </div>
        <div className="bg-gray-700 rounded p-2">
          <div className="font-bold text-blue-400">{atletaStats.defesas}</div>
          <div className="text-gray-400">Defesas</div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-3">
        👆 Clica para registar ação
      </div>
    </button>
  );
}
