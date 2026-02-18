import { Award, Cake, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AtletasDestaqueWidget({ atletasDestaque, loading }) {
  const navigate = useNavigate();
  const { lesionados, aniversariantes, topAssiduidade } = atletasDestaque;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Atletas em Destaque</h3>
            <p className="text-xs text-slate-500">Informações importantes</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Lesionados */}
        {lesionados.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h4 className="text-sm font-semibold text-slate-700">LESIONADOS ({lesionados.length})</h4>
            </div>
            <div className="space-y-2">
              {lesionados.map(atleta => (
                <div
                  key={atleta.id}
                  onClick={() => navigate(`/atletas/${atleta.id}`)}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold text-sm">
                    {atleta.nome?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{atleta.nome}</p>
                    <p className="text-xs text-slate-500">{atleta.equipa}</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">🩹 Lesionado</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aniversariantes */}
        {aniversariantes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cake className="w-4 h-4 text-pink-600" />
              <h4 className="text-sm font-semibold text-slate-700">ANIVERSARIANTES HOJE ({aniversariantes.length})</h4>
            </div>
            <div className="space-y-2">
              {aniversariantes.map(atleta => (
                <div
                  key={atleta.id}
                  onClick={() => navigate(`/atletas/${atleta.id}`)}
                  className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-200 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-sm">
                    {atleta.nome?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{atleta.nome}</p>
                    <p className="text-xs text-slate-500">{atleta.equipa}</p>
                  </div>
                  <span className="text-lg">🎂</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Assiduidade */}
        {topAssiduidade.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-slate-700">TOP ASSIDUIDADE</h4>
            </div>
            <div className="space-y-2">
              {topAssiduidade.map((atleta, idx) => (
                <div
                  key={atleta.id}
                  onClick={() => navigate(`/atletas/${atleta.id}`)}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{atleta.nome}</p>
                    <p className="text-xs text-slate-500">{atleta.equipa}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{atleta.assiduidade}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {lesionados.length === 0 && aniversariantes.length === 0 && topAssiduidade.length === 0 && (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum destaque para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
}
