import { useState, useEffect } from 'react';
import { Star, Clock, X, Check } from 'lucide-react';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useTreinosPendentes } from '../../../hooks/useTreinosPendentes';
import { useAtletasEquipa } from '../../../hooks/useAtletasEquipa';
import { db } from '../../../utils/firebase';

export default function AvaliacoesPendentesWidget({ user, permissions, recarregar }) {
    const [treinoAvaliando, setTreinoAvaliando] = useState(null);
    const [formData, setFormData] = useState({
        positivos: '', negativos: '', estrelas: 3, top5: []
    });

    const equipasIds = permissions?.equipas || [];        // ["Sub 21 F", "Seniores F"]
    const [pagina, setPagina] = useState(1);
    const porPagina = 3;

    const { treinosPendentes, loading, refetch } = useTreinosPendentes(equipasIds);
    const { atletas: atletasEquipa, loading: loadingAtletas } = useAtletasEquipa(equipasIds);


    const equipaId = permissions?.equipas?.[0] || null;
    const [avaliando, setAvaliando] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 text-center text-slate-500">
                <p className="text-sm">⏳ A carregar...</p>
            </div>
        );
    }

    // Se não houver treinos pendentes, mostra mensagem
    if (treinosPendentes.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 text-center text-slate-500">
                <p className="text-sm">✅ Todos os treinos avaliados!</p>
            </div>
        );
    }

    const pendentes = treinosPendentes || [];
    const totalPaginas = Math.ceil(pendentes.length / porPagina);
    const inicio = (pagina - 1) * porPagina;
    const pendentesPagina = pendentes.slice(inicio, inicio + porPagina);

    const handleAbrirModal = (treino) => {
        setFormData({ positivos: '', negativos: '', estrelas: 3, top5: [] });
        setTreinoAvaliando(treino);
    };

    // Função para formatar data bonita
    const formatarDataTreino = (dataISO) => {
        try {
            const data = new Date(dataISO);
            const hoje = new Date();
            const amanha = new Date(hoje);
            amanha.setDate(amanha.getDate() + 1);

            if (data.toDateString() === hoje.toDateString()) {
                return 'HOJE';
            } else if (data.toDateString() === amanha.toDateString()) {
                return 'AMANHÃ';
            }

            return data.toLocaleDateString('pt-PT', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            }).toUpperCase();
        } catch {
            return 'DATA INVÁLIDA';
        }
    };


    const salvarAvaliacao = async () => {
        if (formData.top5.length < 1 || !formData.positivos.trim()) return;

        setAvaliando(true);
        try {
            await addDoc(collection(db, 'avaliacoes_treino'), {
                treinoId: treinoAvaliando.id,
                treinadorId: user.uid,
                equipa: treinoAvaliando.equipa,
                data: treinoAvaliando.data,
                positivos: formData.positivos,
                negativos: formData.negativos || '',
                estrelas: formData.estrelas,
                top5: formData.top5.map(a => a.id),
                createdAt: serverTimestamp()
            });

            refetch();
            setTreinoAvaliando(null);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setAvaliando(false);
        }
    };

    console.log(treinoAvaliando)
    if (pendentes.length === 0) return null;

    if (loadingAtletas) {
        return <p className="text-sm text-slate-500">A carregar atletas...</p>;
    }

    const equipaTreinoAtual = treinoAvaliando?.equipa;

    return (
        <>
            {/* Widget principal */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-3 sm:p-6 mb-6">
                {/* Header sempre visível */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Avaliações Pendentes</h3>
                            <p className="text-xs sm:text-sm text-slate-600">Hoje: <span className="font-semibold text-orange-600">{pendentes.length}</span></p>
                        </div>
                    </div>
                </div>

                {/* Cards dos treinos - Grid responsivo */}
                {/* Cards com DATA BONITA */}
                <div className="space-y-2 sm:space-y-3">
                    {pendentesPagina.map((treino) => {

                        const dataFormatada = formatarDataTreino(treino.data);

                        return (
                            <button
                                key={treino.id}
                                onClick={() => handleAbrirModal(treino)}
                                className="group w-full bg-gradient-to-r from-slate-50 to-blue-50 hover:from-white hover:to-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                            >
                                <div className="flex flex-col gap-2">
                                    {/* Header: Escalão + Data */}
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-lg text-slate-900 truncate pr-2">
                                            {treino.escalao}
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${dataFormatada === 'HOJE'
                                            ? 'bg-orange-100 text-orange-800'
                                            : dataFormatada === 'AMANHÃ'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {dataFormatada}
                                        </div>
                                    </div>

                                    {/* Detalhes: Hora + Local */}
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg shadow-sm border">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            <span className="font-medium text-slate-900">{treino.horaInicio} - {treino.horaFim}</span>
                                        </div>
                                        <span className="truncate">{treino.equipa} - {treino.local}</span>
                                    </div>

                                    {/* Call to action */}
                                    <div className="flex items-center justify-between pt-2 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="text-xs text-slate-500">Clica para avaliar</span>
                                        <div className="flex items-center gap-1 text-blue-600">
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Avaliar</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}

                    {totalPaginas > 1 && (
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                            <button
                                onClick={() => setPagina(p => Math.max(1, p - 1))}
                                disabled={pagina === 1}
                                className="px-3 py-1 rounded-xl border border-slate-300 disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <span>Página {pagina} de {totalPaginas}</span>
                            <button
                                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                                disabled={pagina === totalPaginas}
                                className="px-3 py-1 rounded-xl border border-slate-300 disabled:opacity-40"
                            >
                                Seguinte
                            </button>
                        </div>
                    )}

                </div>


                {/* Indicador mais treinos mobile */}
                {pendentes.length > 3 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">+{pendentes.length - 3} treinos para avaliar</p>
                    </div>
                )}
            </div>


            {/* Modal RESPONSIVO - Mobile:400px | Tablet:500px | Desktop:600px+ */}
            {treinoAvaliando && (

                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200"
                        onClick={() => setTreinoAvaliando(null)}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in-0 zoom-in-95 duration-200 min-h-screen">
                        <div
                            className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-200 sm:duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white p-5 sm:p-6 lg:p-8">
                                <div className="flex items-center justify-between mb-3 lg:mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
                                            <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight">
                                                Avaliar Treino
                                            </h3>
                                            <p className="text-blue-100 text-sm sm:text-base opacity-90 mt-1">
                                                {treinoAvaliando.equipa} • {formatarDataTreino(treinoAvaliando.data)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setTreinoAvaliando(null)}
                                        className="p-2 sm:p-2.5 hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all hover:scale-105 shadow-lg"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-5 sm:p-6 lg:p-8 max-h-[60vh] overflow-y-auto space-y-6 lg:space-y-7">
                                {/* Estrelas - Centralizadas */}
                                <div className="text-center">
                                    <label className="block text-sm lg:text-base font-bold mb-4 lg:mb-5 text-slate-800 uppercase tracking-wide">
                                        Classificação Geral
                                    </label>
                                    <div className="flex gap-2 sm:gap-3 justify-center max-w-xs mx-auto">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, estrelas: n }))}
                                                className={`flex-1 p-3 sm:p-4 lg:p-5 rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.05] hover:-translate-y-0.5 ${formData.estrelas >= n
                                                    ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 shadow-yellow-400/50'
                                                    : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400'
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Textareas - Grid responsivo */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                    <div>
                                        <label className="block text-xs lg:text-sm font-bold uppercase tracking-wide text-green-700 mb-3 lg:mb-4">
                                            ✅ Pontos Positivos
                                        </label>
                                        <textarea
                                            value={formData.positivos}
                                            onChange={e => setFormData(p => ({ ...p, positivos: e.target.value }))}
                                            rows={4}
                                            className="w-full p-4 lg:p-5 border-2 rounded-2xl font-medium text-sm lg:text-base resize-none focus:outline-none focus:ring-4 focus:ring-green-200/50 transition-all duration-200 placeholder-slate-400 shadow-sm hover:shadow-md hover:border-green-300"
                                            placeholder="O que correu muito bem no treino? Seja específico!"
                                            style={{ minHeight: '120px' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs lg:text-sm font-bold uppercase tracking-wide text-red-700 mb-3 lg:mb-4">
                                            ❌ A Melhorar
                                        </label>
                                        <textarea
                                            value={formData.negativos}
                                            onChange={e => setFormData(p => ({ ...p, negativos: e.target.value }))}
                                            rows={4}
                                            className="w-full p-4 lg:p-5 border-2 rounded-2xl font-medium text-sm lg:text-base resize-none focus:outline-none focus:ring-4 focus:ring-red-200/50 transition-all duration-200 placeholder-slate-400 shadow-sm hover:shadow-md hover:border-red-300"
                                            placeholder="Onde a equipa pode melhorar? Seja honesto!"
                                            style={{ minHeight: '120px' }}
                                        />
                                    </div>
                                </div>

                                {/* Top 5 - Lista scrollable */}
                                {/* 🏆 Top 5 - NOVO LAYOUT */}
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <label className="text-sm lg:text-base font-bold text-slate-800">
                                            🏆 Top 5 Atletas (clica para selecionar)
                                        </label>
                                        <span className="text-xs lg:text-sm text-slate-500 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                                            {formData.top5.length}/5
                                        </span>
                                    </div>

                                    {/* ✅ 1. SELECIONADOS EM CIMA (chips horizontais) */}
                                    {formData.top5.length > 0 && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-2xl">
                                            <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-3 px-1">
                                                ✅ Selecionados
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.top5.map((atleta, index) => (
                                                    <div key={atleta.id} className="flex items-center gap-2 bg-white border border-green-300 rounded-xl px-3 py-2 shadow-sm">
                                                        <span className="w-6 h-6 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="font-semibold text-green-900 text-sm truncate max-w-[120px] sm:max-w-[160px]">
                                                            {atleta.nome}
                                                        </span>
                                                        <button
                                                            onClick={() => setFormData(p => ({ ...p, top5: p.top5.filter(a => a.id !== atleta.id) }))}
                                                            className="p-1 hover:bg-green-200 rounded-lg transition-colors ml-1"
                                                            title="Remover"
                                                        >
                                                            <X className="w-4 h-4 text-green-700" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ✅ 2. PESQUISA */}
                                    <div className="relative mb-5">
                                        <input
                                            type="text"
                                            placeholder="Procurar atleta pelo nome..."
                                            value={formData.pesquisa || ''}
                                            onChange={e => setFormData(p => ({ ...p, pesquisa: e.target.value }))}
                                            className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 text-sm lg:text-base shadow-sm transition-all"
                                        />
                                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    {/* ✅ 3. GRID 2 COLUNAS (sem scroll!) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        {atletasEquipa
                                            .filter(atleta =>
                                                !formData.pesquisa ||
                                                atleta.nome.toLowerCase().includes(formData.pesquisa.toLowerCase())
                                            )
                                            .filter(atleta => !formData.top5.some(s => s.id === atleta.id))
                                            .slice(0, 10)
                                            .map((atleta) => (
                                                <button
                                                    key={atleta.id}
                                                    onClick={() => {
                                                        let newTop5 = [...formData.top5, atleta];
                                                        if (newTop5.length > 5) newTop5 = newTop5.slice(-5);
                                                        setFormData(p => ({ ...p, top5: newTop5, pesquisa: '' }));
                                                    }}
                                                    className="group w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition-all hover:shadow-xl hover:scale-[1.02] text-left shadow-sm h-full flex flex-col items-start justify-center"
                                                >
                                                    <div className="font-semibold text-slate-900 text-base mb-1 group-hover:text-blue-800">
                                                        {atleta.nome}
                                                    </div>
                                                    <p className="text-xs text-slate-500 group-hover:text-slate-600">
                                                        Clica para adicionar ao Top 5
                                                    </p>
                                                </button>
                                            ))}
                                    </div>

                                    {/* ✅ Mensagem se não houver mais */}
                                    {formData.top5.length >= 5 && (
                                        <p className="text-center text-sm text-slate-500 mt-3 py-3 bg-slate-50 rounded-xl">
                                            ✅ Top 5 completo!
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Footer - Responsivo */}
                            <div className="p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200">
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                                    <button
                                        onClick={() => setTreinoAvaliando(null)}
                                        className="w-full sm:w-auto flex-1 sm:flex-none px-6 sm:px-8 py-3.5 lg:py-4 text-slate-700 font-bold text-sm lg:text-base border-2 border-slate-300 rounded-2xl hover:bg-slate-100 hover:border-slate-400 hover:shadow-md transition-all duration-200 shadow-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={salvarAvaliacao}
                                        disabled={avaliando || formData.top5.length < 1 || !formData.positivos.trim()}
                                        className="w-full sm:w-auto flex-1 sm:flex-none px-6 sm:px-8 py-3.5 lg:py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold text-sm lg:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md flex items-center justify-center gap-2 transition-all duration-200"
                                    >
                                        {avaliando ? (
                                            <>
                                                <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full animate-spin shadow-lg" />
                                                <span>A Guardar...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5 lg:w-6 lg:h-6" />
                                                <span>Guardar Avaliação</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </>
    );
}
