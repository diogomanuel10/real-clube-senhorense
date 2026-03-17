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
  const [paginaRanking, setPaginaRanking] = useState(1);
  const [porPaginaRanking] = useState(5); // 5 por página
  const [paginaAvaliacoes, setPaginaAvaliacoes] = useState(1);
  const porPaginaAvaliacoes = 5;

  useEffect(() => {
    setPaginaAvaliacoes(1);
  }, [equipaSelecionada]);

  useEffect(() => {
    setPaginaRanking(1); // Reset quando muda equipa
  }, [equipaSelecionada]);

  useEffect(() => {
    if (!equipaSelecionada && equipasDoTreinador.length > 0) {
      setEquipaSelecionada(equipasDoTreinador[0]);
      setPaginaRanking(1);
    }
  }, [equipasDoTreinador]);

  const { avaliacoes, loading: loadingAvaliacoes, atletasStats } =
    useAvaliacoesEquipa(equipaSelecionada);
  const { atletas, loading: loadingAtletas } =
    useAtletasEquipa(equipaSelecionada);



  // Remove o .slice(0,10) do topAtletas e usa TODOS os ordenados
  const topAtletas = Object.entries(atletasStats)
    .sort(([, a], [, b]) => b - a)
    .map(([id, pontos], index) => {
      const atleta = atletas.find(a => a.id === id);
      return {
        id,
        nome: atleta?.nome || 'Atleta sem nome',
        pontos,
        posicao: index + 1
      };
    });

  // Paginação
  const totalPaginasRanking = Math.ceil(topAtletas.length / porPaginaRanking);
  const inicioRanking = (paginaRanking - 1) * porPaginaRanking;
  const topAtletasPagina = topAtletas.slice(inicioRanking, inicioRanking + porPaginaRanking);

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
          {/* Ranking Atletas - SEM SCROLL, SÓ PAGINAÇÃO */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 border-b border-slate-200">
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Award className="w-7 h-7 lg:w-8 lg:h-8" />
                Ranking Atletas
              </h2>
              <div className="hidden sm:block text-xs lg:text-sm text-slate-500 font-medium">
                {topAtletas.length} atletas • Página {paginaRanking} de {totalPaginasRanking}
              </div>
            </div>

            {/* Lista FIXA - 6 itens max (perfeita para 1 página) */}
            <div className="space-y-3 mb-8">
              {topAtletasPagina.map(({ id, nome, pontos, posicao }) => (
                <div
                  key={id}
                  className="group flex items-center gap-4 p-4 lg:p-5 bg-gradient-to-r from-slate-50/80 to-blue-50/50 hover:from-slate-100 hover:to-blue-100 border border-slate-200/50 hover:border-blue-200 hover:shadow-lg transition-all rounded-xl h-20 lg:h-22 flex-shrink-0"
                >
                  {/* Medalha */}
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center font-black text-xl lg:text-2xl shadow-lg flex-shrink-0 rounded-xl ${posicao === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-yellow-400/50' :
                    posicao === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-slate-400/50' :
                      posicao === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-400/50' :
                        'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 shadow-sm'
                    }`}>
                    {posicao <= 3 ? ['🥇', '🥈', '🥉'][posicao - 1] : `#${posicao}`}
                  </div>

                  {/* Nome */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base lg:text-lg text-slate-900 truncate pr-2 capitalize">
                      {nome}
                    </p>
                    <p className="text-xs text-slate-500">Pontos acumulados</p>
                  </div>

                  {/* Pontos */}
                  <div className="text-right">
                    <div className="text-xl lg:text-2xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-xl shadow-lg">
                      {pontos}pts
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação FULL WIDTH - SEMPRE VISÍVEL */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2">
                {/* Anterior */}
                <button
                  onClick={() => setPaginaRanking(p => Math.max(1, p - 1))}
                  disabled={paginaRanking === 1}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl border-2 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 flex items-center justify-center disabled:hover:shadow-md disabled:hover:translate-y-0 bg-white border-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Páginas */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-inner">
                  {Array.from({ length: totalPaginasRanking }, (_, i) => i + 1).map(pagina => (
                    <button
                      key={pagina}
                      onClick={() => setPaginaRanking(pagina)}
                      className={`w-10 h-10 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center ${paginaRanking === pagina
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-300/50 scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:scale-[1.02]'
                        }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                {/* Próxima */}
                <button
                  onClick={() => setPaginaRanking(p => Math.min(totalPaginasRanking, p + 1))}
                  disabled={paginaRanking === totalPaginasRanking}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl border-2 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 flex items-center justify-center disabled:hover:shadow-md disabled:hover:translate-y-0 bg-white border-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>


          {/* Últimas Avaliações - COM PAGINAÇÃO */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 lg:w-8 lg:h-8" />
                Últimas Avaliações
              </h2>
              <div className="text-xs lg:text-sm text-slate-500 font-medium">
                {avaliacoes.length} total • Página {paginaAvaliacoes} de {Math.ceil(avaliacoes.length / porPaginaAvaliacoes)}
              </div>
            </div>

            {/* Lista paginada - SEM SCROLL */}
            <div className="space-y-3 mb-8">
              {avaliacoes
                .slice((paginaAvaliacoes - 1) * porPaginaAvaliacoes, paginaAvaliacoes * porPaginaAvaliacoes)
                .map(av => (
                  <button
                    key={av.id}
                    onClick={() => setAvaliacaoSelecionada(av)}
                    className="group w-full p-3 lg:p-4 border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-300 hover:bg-slate-50 transition-all h-18 lg:h-20 flex items-start gap-3 overflow-hidden">
                    {/* Estrelas + Data */}
                    <div className="flex flex-col items-start gap-1.5 flex-shrink-0 pt-1">
                      <div className="flex gap-0.5">
                        {Array(5).fill().map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < av.estrelas ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {av.createdAt.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-sm lg:text-base text-slate-900 line-clamp-2 leading-tight">
                        {av.positivos}
                      </h4>
                      {av.negativos && (
                        <p className="text-xs text-slate-600 line-clamp-1">⚠️ {av.negativos}</p>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>

            {/* Paginação igual ao ranking */}
            {Math.ceil(avaliacoes.length / porPaginaAvaliacoes) > 1 && (
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPaginaAvaliacoes(p => Math.max(1, p - 1))}
                    disabled={paginaAvaliacoes === 1}
                    className="w-12 h-12 rounded-2xl border-2 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 flex items-center justify-center bg-white border-slate-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    {Array.from({ length: Math.ceil(avaliacoes.length / porPaginaAvaliacoes) }, (_, i) => i + 1).map(pagina => (
                      <button
                        key={pagina}
                        onClick={() => setPaginaAvaliacoes(pagina)}
                        className={`w-10 h-10 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center ${paginaAvaliacoes === pagina
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-300/50 scale-105'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md'
                          }`}
                      >
                        {pagina}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaAvaliacoes(p => Math.min(Math.ceil(avaliacoes.length / porPaginaAvaliacoes), p + 1))}
                    disabled={paginaAvaliacoes === Math.ceil(avaliacoes.length / porPaginaAvaliacoes)}
                    className="w-12 h-12 rounded-2xl border-2 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 flex items-center justify-center bg-white border-slate-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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
                      className={`w-5 h-5 ${i < avaliacaoSelecionada.estrelas
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
