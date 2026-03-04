import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, Calendar, Award, BarChart3, Loader2, X } from 'lucide-react';
import { useAvaliacoesEquipa } from '../hooks/useAvaliacoesEquipa';
import { useAtletasEquipa } from '../hooks/useAtletasEquipa';
import { usePermissions } from "../hooks/usePermissions";

export default function AvaliacoesEquipaPage({ user }) {

    const permissions = usePermissions(user);
    const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
    const equipasDoTreinador = permissions?.equipas || []; // ["Sub 21 F", "Seniores F"]
    const [equipaSelecionada, setEquipaSelecionada] = useState(equipasDoTreinador[0] || null);

    useEffect(() => {
  if (!equipaSelecionada && equipasDoTreinador.length > 0) {
    setEquipaSelecionada(equipasDoTreinador[0]);
  }
}, [equipasDoTreinador, equipaSelecionada]);

    const { avaliacoes, loading: loadingAvaliacoes, atletasStats } =
        useAvaliacoesEquipa(equipaSelecionada);
    const { atletas, loading: loadingAtletas } =
        useAtletasEquipa(equipaSelecionada);



    const topAtletas = Object.entries(atletasStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id, pontos], index) => {
            const atleta = atletas.find(a => a.id === id);
            return {
                id,
                nome: atleta?.nome || 'Atleta sem nome', // 👈 Campo 'nome' da tua coleção
                pontos,
                posicao: index + 1
            };
        });

    // Média estrelas
    const mediaEstrelas = avaliacoes.reduce((sum, a) => sum + a.estrelas, 0) / (avaliacoes.length || 1);

    return (
       <>
      <div className="space-y-8">
        {/* Selector equipa */}
        <div className="flex justify-end mb-4">
          <select
            value={equipaSelecionada || ''}
            onChange={(e) => setEquipaSelecionada(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm"
          >
            {equipasDoTreinador.map(nome => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              🏆 Avaliações da Equipa
            </h1>
            <p className="text-xl text-slate-600 mt-2">Métricas e destaques dos treinos</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900">{avaliacoes.length}</div>
            <p className="text-sm text-slate-500">Avaliações totais</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-yellow-900" />
              </div>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">
                Média Estrelas
              </p>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {mediaEstrelas.toFixed(1)}/5
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-emerald-900" />
              </div>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">
                Treinos avaliados
              </p>
            </div>
            <div className="text-3xl font-black text-slate-900">{avaliacoes.length}</div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-blue-900" />
              </div>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">
                Atletas destacados
              </p>
            </div>
            <div className="text-3xl font-black text-slate-900">{topAtletas.length}</div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-purple-900" />
              </div>
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">
                Melhor atleta
              </p>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {topAtletas[0]?.pontos || 0}pts
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ranking Atletas */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Award className="w-8 h-8" />
              Ranking Atletas
            </h2>
            <div className="space-y-3">
              {topAtletas.map(({ id, nome, pontos, posicao }) => (
                <div
                  key={id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl">
                    #{posicao}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-slate-900 capitalize truncate">
                      Atleta {nome}
                    </p>
                    <p className="text-sm text-slate-500">Total pontos</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">{pontos}pts</div>
                    <div className="text-xs text-emerald-600 font-bold">
                      +{pontos * 10}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimas Avaliações */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Últimas Avaliações</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {avaliacoes.slice(0, 5).map(av => (
                <button
                  key={av.id}
                  onClick={() => setAvaliacaoSelecionada(av)}
                  className="w-full text-left p-5 border border-slate-200 rounded-2xl hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      {Array(5).fill().map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < av.estrelas
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-slate-600 ml-auto">
                      {av.createdAt.toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    {av.positivos}
                  </h4>
                  {av.negativos && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {av.negativos}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de leitura da avaliação */}
      {avaliacaoSelecionada && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setAvaliacaoSelecionada(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black">Detalhe da Avaliação</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    {avaliacaoSelecionada.createdAt.toLocaleDateString('pt-PT')}
                  </p>
                </div>
                <button
                  onClick={() => setAvaliacaoSelecionada(null)}
                  className="p-2 hover:bg-white/20 rounded-2xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-2">
                  {Array(5).fill().map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < avaliacaoSelecionada.estrelas
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-slate-700 ml-2">
                    {avaliacaoSelecionada.estrelas}/5
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-green-700 uppercase mb-1">
                    Pontos Positivos
                  </h4>
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {avaliacaoSelecionada.positivos}
                  </p>
                </div>

                {avaliacaoSelecionada.negativos && (
                  <div>
                    <h4 className="text-sm font-bold text-red-700 uppercase mb-1">
                      A Melhorar
                    </h4>
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {avaliacaoSelecionada.negativos}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
    );

   

}
