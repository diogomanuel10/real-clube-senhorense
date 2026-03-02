import React, { useMemo } from 'react';
import { BarChart3, TrendingDown, Clock, Target } from 'lucide-react';

const EstatisticasLesoes = ({ atletaId, episodios }) => {
    const estatisticas = useMemo(() => {
        if (episodios.length === 0) return null;

        const tiposLesao = {};
        episodios.forEach(ep => {
            const diag = (ep.diagnosticoFuncional || '').toLowerCase();
            if (diag.includes('entorse')) {
                tiposLesao['Entorse'] = (tiposLesao['Entorse'] || 0) + 1;
            } else if (diag.includes('contract') || diag.includes('contrát')) {
                tiposLesao['Contratura'] = (tiposLesao['Contratura'] || 0) + 1;
            } else if (diag.includes('tendin') || diag.includes('tendão')) {
                tiposLesao['Tendinite'] = (tiposLesao['Tendinite'] || 0) + 1;
            } else if (diag.includes('dor') || diag.includes('algia')) {
                tiposLesao['Dor/Algia'] = (tiposLesao['Dor/Algia'] || 0) + 1;
            } else {
                tiposLesao['Outros'] = (tiposLesao['Outros'] || 0) + 1;
            }
        });

        const episodiosFechados = episodios.filter(ep => ep.estado === 'alta' && ep.dataInicio && ep.dataAlta);
        const duracaoMedia = episodiosFechados.length > 0
            ? episodiosFechados.reduce((acc, ep) => {
                const dias = Math.floor((new Date(ep.dataAlta) - new Date(ep.dataInicio)) / (1000 * 60 * 60 * 24));
                return acc + dias;
            }, 0) / episodiosFechados.length
            : 0;

        let lesaoMaisLonga = null;
        let diasMaximo = 0;
        episodiosFechados.forEach(ep => {
            const dias = Math.floor((new Date(ep.dataAlta) - new Date(ep.dataInicio)) / (1000 * 60 * 60 * 24));
            if (dias > diasMaximo) {
                diasMaximo = dias;
                lesaoMaisLonga = ep;
            }
        });

        const locaisAnatomicos = {};
        episodios.forEach(ep => {
            const diag = (ep.diagnosticoFuncional || '').toLowerCase();
            if (diag.includes('joelho')) {
                locaisAnatomicos['Joelho'] = (locaisAnatomicos['Joelho'] || 0) + 1;
            } else if (diag.includes('tornozelo') || diag.includes('tibiotársica')) {
                locaisAnatomicos['Tornozelo'] = (locaisAnatomicos['Tornozelo'] || 0) + 1;
            } else if (diag.includes('ombro')) {
                locaisAnatomicos['Ombro'] = (locaisAnatomicos['Ombro'] || 0) + 1;
            } else if (diag.includes('costas') || diag.includes('lombar') || diag.includes('dorsal')) {
                locaisAnatomicos['Costas'] = (locaisAnatomicos['Costas'] || 0) + 1;
            } else if (diag.includes('coxa') || diag.includes('isémio') || diag.includes('quádri')) {
                locaisAnatomicos['Coxa'] = (locaisAnatomicos['Coxa'] || 0) + 1;
            } else {
                locaisAnatomicos['Outros'] = (locaisAnatomicos['Outros'] || 0) + 1;
            }
        });

        return {
            tiposLesao,
            duracaoMedia: Math.round(duracaoMedia),
            lesaoMaisLonga,
            diasMaximo,
            locaisAnatomicos,
            totalEpisodios: episodios.length,
            episodiosAtivos: episodios.filter(ep => ep.estado === 'ativo').length,
            episodiosFechados: episodiosFechados.length
        };
    }, [episodios]);

    if (!estatisticas || estatisticas.totalEpisodios === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sem Dados</h3>
                <p className="text-gray-600">
                    Não há dados suficientes para gerar estatísticas.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Total Lesões</p>
                        <Target className="text-blue-600" size={18} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{estatisticas.totalEpisodios}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Duração Média</p>
                        <Clock className="text-orange-600" size={18} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {estatisticas.duracaoMedia} <span className="text-sm font-normal text-gray-500">dias</span>
                    </p>
                </div>

                <div className="bg_WHITE rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Lesão Mais Longa</p>
                        <TrendingDown className="text-red-600" size={18} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {estatisticas.diasMaximo} <span className="text-sm font-normal text-gray-500">dias</span>
                    </p>
                    {estatisticas.lesaoMaisLonga && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                            {estatisticas.lesaoMaisLonga.diagnosticoFuncional}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Taxa Recuperação</p>
                        <BarChart3 className="text-green-600" size={18} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {Math.round((estatisticas.episodiosFechados / estatisticas.totalEpisodios) * 100)}%
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesões por Tipo</h3>
                <div className="space-y-3">
                    {Object.entries(estatisticas.tiposLesao)
                        .sort((a, b) => b[1] - a[1])
                        .map(([tipo, count]) => {
                            const percentage = (count / estatisticas.totalEpisodios) * 100;
                            return (
                                <div key={tipo}>
                                    <div className="flex items-center justify_between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{tipo}</span>
                                        <span className="text-gray-500">{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesões por Local Anatômico</h3>
                <div className="space-y-3">
                    {Object.entries(estatisticas.locaisAnatomicos)
                        .sort((a, b) => b[1] - a[1])
                        .map(([local, count]) => {
                            const percentage = (count / estatisticas.totalEpisodios) * 100;
                            return (
                                <div key={local}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">{local}</span>
                                        <span className="text-gray-500">{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Análise</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p>
                        • Este atleta teve <strong>{estatisticas.totalEpisodios} episódios clínicos</strong> registados.
                    </p>
                    {estatisticas.episodiosFechados > 0 && (
                        <p>
                            • A duração média de recuperação é de <strong>{estatisticas.duracaoMedia} dias</strong>.
                        </p>
                    )}
                    {Object.keys(estatisticas.tiposLesao).length > 0 && (
                        <p>
                            • O tipo de lesão mais comum é <strong>{Object.entries(estatisticas.tiposLesao).sort((a, b) => b[1] - a[1])[0][0]}</strong>.
                        </p>
                    )}
                    {Object.keys(estatisticas.locaisAnatomicos).length > 0 && (
                        <p>
                            • A zona mais afetada é <strong>{Object.entries(estatisticas.locaisAnatomicos).sort((a, b) => b[1] - a[1])[0][0]}</strong>.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EstatisticasLesoes;
