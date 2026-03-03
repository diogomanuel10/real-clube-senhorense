import { AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

export default function LesoesWidget({ equipas }) {
  const [lesoes, setLesoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarLesoes();
  }, [equipas]);

  const carregarLesoes = async () => {
    if (!equipas || equipas.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const atletasRef = collection(db, 'atletas');
      const q = query(
        atletasRef,
        where('equipa', 'in', equipas),
        where('estado', '==', 'lesionado') // ou 'indisponivel'
      );
      
      const snap = await getDocs(q);
      const dados = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLesoes(dados);
    } catch (err) {
      console.error('Erro ao carregar lesões:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-slate-900">Atletas Indisponíveis</h3>
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
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-bold text-slate-900">Atletas Indisponíveis</h3>
        </div>
        {lesoes.length > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            {lesoes.length}
          </span>
        )}
      </div>

      {lesoes.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Todos disponíveis! 🎉
          </p>
          <p className="text-xs text-slate-500">
            Nenhum atleta lesionado ou indisponível
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {lesoes.map((atleta) => (
            <div key={atleta.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-red-200 flex items-center justify-center text-xs font-semibold text-red-800">
                      {atleta.nome?.charAt(0) || '?'}
                    </div>
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {atleta.nome}
                    </p>
                  </div>
                  <p className="text-xs text-red-700 ml-9">
                    {atleta.motivoIndisponibilidade || atleta.lesao || 'Indisponível'}
                  </p>
                </div>
                {atleta.previsaoRetorno && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-500 mb-0.5">Retorno</p>
                    <p className="text-xs font-bold text-red-700">
                      {new Date(atleta.previsaoRetorno).toLocaleDateString('pt-PT', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
