import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, Calendar, Award, BarChart3, Loader2 } from 'lucide-react';
import { useAvaliacoesEquipa } from '../hooks/useAvaliacoesEquipa';
import { useAtletasEquipa } from '../hooks/useAtletasEquipa';
import { usePermissions } from "../hooks/usePermissions";

export default function AvaliacoesEquipaPage({ user }) {
    const permissions = usePermissions(user);
    const equipaId = permissions?.equipas?.[0] || null;
    const { avaliacoes, loading: loadingAvaliacoes, atletasStats } = useAvaliacoesEquipa(equipaId);
    const { atletas, loading: loadingAtletas } = useAtletasEquipa(equipaId); // 👈 NOVO

 if (loadingAvaliacoes || loadingAtletas) {
    return <div className="text-center text-slate-900 p-12">⏳ A carregar...</div>;
  }

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
        <div className="space-y-8">
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
                        <div>
                            <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">Média Estrelas</p>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{mediaEstrelas.toFixed(1)}/5</div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-900" />
                        </div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">Treinos avaliados</p>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{avaliacoes.length}</div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-6 h-6 text-blue-900" />
                        </div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">Atletas destacados</p>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{topAtletas.length}</div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Award className="w-6 h-6 text-purple-900" />
                        </div>
                        <p className="text-sm text-slate-500 uppercase font-bold tracking-wide">Melhor atleta</p>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{topAtletas[0]?.pontos || 0}pts</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TOP 5 ATLETAS */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <Award className="w-8 h-8" />
                        Ranking Atletas
                    </h2>
                    <div className="space-y-3">
                        {topAtletas.map(({ id, nome, pontos, posicao }) => (
                            <div key={id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl hover:shadow-md transition-all">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl">
                                    #{posicao}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-lg text-slate-900 capitalize truncate">Atleta {nome}</p>
                                    <p className="text-sm text-slate-500">Total pontos</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900">{pontos}pts</div>
                                    <div className="text-xs text-emerald-600 font-bold">+{pontos * 10}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÚLTIMAS AVALIAÇÕES */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Últimas Avaliações</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {avaliacoes.slice(0, 5).map(av => (
                            <div key={av.id} className="p-5 border border-slate-200 rounded-2xl hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex gap-1">
                                        {Array(5).fill().map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < av.estrelas ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 ml-auto">
                                        {av.createdAt.toLocaleDateString('pt-PT')}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 mb-2">{av.positivos?.slice(0, 50)}...</h4>
                                <p className="text-sm text-slate-600 line-clamp-2">{av.negativos}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
