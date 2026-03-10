import { AlertCircle, CheckCircle, Clock, XCircle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../../../utils/firebase';

export default function CaptaçõesAprovadasWidget({ escaloes, treinadorUid }) {
    const [captações, setCaptações] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cores e ícones por estado da direção
    const getStatusConfig = (aprovadoDirecao) => {
        switch (aprovadoDirecao) {
            case 'aprovado':
                return {
                    bg: 'bg-green-50 border-green-200',
                    icon: AlertCircle,
                    iconColor: 'text-green-600',
                    badge: 'bg-green-100 text-green-700',
                    title: 'Aprovadas'
                };
            case 'rejeitado':
                return {
                    bg: 'bg-red-50 border-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-600',
                    badge: 'bg-red-100 text-red-700',
                    title: 'Rejeitadas'
                };
            default: // pendente
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-600',
                    badge: 'bg-yellow-100 text-yellow-700',
                    title: 'Pendentes'
                };
        }
    };

    useEffect(() => {
        carregarCaptações();
    }, [escaloes, treinadorUid]);

    const carregarCaptações = async () => {
        if (!escaloes || escaloes.length === 0 || !treinadorUid) {
            setCaptações([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const capRef = collection(db, 'captacoes');
            const todasCaptações = [];

            for (const escalao of escaloes) {
                const q = query(
                    capRef,
                    where('escalao', '==', escalao),
                    where('criadoPorUid', '==', treinadorUid),
                    orderBy('dataRegisto', 'desc'),
                    limit(5)
                );

                const snap = await getDocs(q);
                snap.docs.forEach(doc => {
                    todasCaptações.push({ id: doc.id, ...doc.data() });
                });
            }

            todasCaptações.sort((a, b) => new Date(b.dataRegisto) - new Date(a.dataRegisto));
            setCaptações(todasCaptações.slice(0, 8)); // Top 8 total
        } catch (err) {
            console.error('Erro ao carregar captações:', err);
        } finally {
            setLoading(false);
        }
    };

    const marcarTratado = async (id) => {
        try {
            const capDoc = doc(db, 'captacoes', id);
            await updateDoc(capDoc, {
                tratadoTreinador: true,
                dataTratadoTreinador: new Date().toISOString()
            });

            setCaptações(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erro ao marcar como tratado:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-slate-900">Captações</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-bold text-slate-900">Minhas Captações</h3>
                </div>
                {captações.length > 0 && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                        {captações.length}
                    </span>
                )}
            </div>

            {captações.length === 0 ? (
                <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-900 mb-1">Nenhuma captação!</p>
                    <p className="text-xs text-slate-500">Crie novas captações para ver aqui</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {captações.map((captacao) => {
                        const config = getStatusConfig(captacao.aprovadoDirecao);
                        const Icon = config.icon;

                        return (
                            <div key={captacao.id} className={`p-3 ${config.bg} border rounded-lg group`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                                {captacao.nome?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 truncate">
                                                    {captacao.nome}
                                                </p>
                                                <p className="text-xs text-slate-600">
                                                    {captacao.escalao} • {captacao.posicao || 'N/D'} • {captacao.idade} anos
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-2">
                                            <p className={`text-xs font-medium ${config.iconColor}`}>
                                                <span className="font-bold">Pontos Positivos:</span> {captacao.pontosPositivos}
                                            </p>
                                            {captacao.pontosNegativos && (
                                                <p className={`text-xs ${config.iconColor}`}>
                                                    <span className="font-bold">Pontos Negativos:</span> {captacao.pontosNegativos}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mb-1">
                                            <span>📞 {captacao.telemovel}</span>
                                            <span>👨‍👩‍👧 {captacao.encarregadoNome}</span>
                                        </div>

                                        {/* Badge de status */}
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}>
                                            {captacao.aprovadoDirecao === 'aprovado' ? '✅ Aprovado' :
                                                captacao.aprovadoDirecao === 'rejeitado' ? '❌ Rejeitado' : '⏳ Pendente'}
                                        </span>
                                    </div>

                                    {/* Botão só para aprovadas não tratadas */}
                                    {captacao.aprovadoDirecao === 'aprovado' && !captacao.tratadoTreinador && (
                                        <button
                                            onClick={() => marcarTratado(captacao.id)}
                                            className="p-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                            title="Marcar como tratado"
                                        >
                                            <Check className="w-4 h-4 text-green-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
