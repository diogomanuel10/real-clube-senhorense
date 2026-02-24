import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const HistoricoEpisodios = ({ atletaId, episodios }) => {
    if (episodios.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sem Histórico</h3>
                <p className="text-gray-600">
                    Este atleta não tem episódios clínicos registados.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos os Episódios</h3>
                <div className="space-y-3">
                    {episodios.map((ep) => {
                        const isAtivo = ep.estado === 'ativo';
                        const diasDuracao = ep.dataInicio && ep.dataAlta 
                            ? Math.floor((new Date(ep.dataAlta) - new Date(ep.dataInicio)) / (1000 * 60 * 60 * 24))
                            : null;

                        return (
                            <div
                                key={ep.id}
                                className={`border rounded-xl p-4 ${
                                    isAtivo ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {isAtivo ? (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            )}
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                {ep.diagnosticoFuncional || 'Sem diagnóstico'}
                                            </h4>
                                        </div>
                                        
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <p>
                                                <span className="font-medium">Início:</span> {ep.dataInicio || '-'}
                                                {ep.dataAlta && (
                                                    <span className="ml-2">
                                                        <span className="font-medium">Alta:</span> {ep.dataAlta}
                                                    </span>
                                                )}
                                            </p>
                                            
                                            {diasDuracao !== null && (
                                                <p>
                                                    <span className="font-medium">Duração:</span> {diasDuracao} dias
                                                </p>
                                            )}

                                            {ep.planoTratamento && (
                                                <p className="mt-2">
                                                    <span className="font-medium">Plano:</span> {ep.planoTratamento}
                                                </p>
                                            )}

                                            {ep.restricoesTreinoJogo && (
                                                <p className="text-amber-700 font-medium">
                                                    ⚠️ {ep.restricoesTreinoJogo}
                                                </p>
                                            )}

                                            {ep.previsaoRetorno && isAtivo && (
                                                <p className="text-blue-600">
                                                    <span className="font-medium">Previsão:</span> {ep.previsaoRetorno}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <span
                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                            isAtivo
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}
                                    >
                                        {isAtivo ? 'Ativo' : 'Alta'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">Total de Lesões</p>
                    <p className="text-2xl font-bold text-gray-900">{episodios.length}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">Em Tratamento</p>
                    <p className="text-2xl font-bold text-red-600">
                        {episodios.filter(ep => ep.estado === 'ativo').length}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">Recuperados</p>
                    <p className="text-2xl font-bold text-green-600">
                        {episodios.filter(ep => ep.estado === 'alta').length}
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-500 mb-1">Taxa Recuperação</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {episodios.length > 0 
                            ? Math.round((episodios.filter(ep => ep.estado === 'alta').length / episodios.length) * 100)
                            : 0}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HistoricoEpisodios;