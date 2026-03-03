import { Trophy, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { useNavigate } from 'react-router-dom';

export default function UltimoJogoWidget({ equipas }) {
  const navigate = useNavigate();
  const [ultimoJogo, setUltimoJogo] = useState(null);
  const [estatisticas, setEstatisticas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarUltimoJogo();
  }, [equipas]);

  const carregarUltimoJogo = async () => {
    if (!equipas || equipas.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const jogosRef = collection(db, 'jogos');
      const q = query(
        jogosRef,
        where('equipa', 'in', equipas),
        orderBy('data', 'desc'),
        limit(10) // Busca os 10 últimos
      );
      
      const snap = await getDocs(q);
      
      // 👇 CORRIGIDO - Aceita "finalizado" ou realizado: true
      const jogosFinalizados = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(j => j.estado === 'finalizado' || j.realizado === true);

      if (jogosFinalizados.length > 0) {
        const jogoData = jogosFinalizados[0]; // Pega o mais recente
        setUltimoJogo(jogoData);

        // Busca estatísticas desse jogo
        const statsRef = collection(db, 'estatisticas_jogo');
        const statsQuery = query(
          statsRef,
          where('jogoId', '==', jogoData.id)
        );
        
        const statsSnap = await getDocs(statsQuery);
        const statsData = statsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Busca nomes dos atletas
        const statsComNomes = await Promise.all(
          statsData.map(async (stat) => {
            if (stat.atletaId) {
              try {
                const atletaDoc = await getDoc(doc(db, 'atletas', stat.atletaId));
                if (atletaDoc.exists()) {
                  return {
                    ...stat,
                    atletaNome: atletaDoc.data().nome
                  };
                }
              } catch (err) {
                console.error('Erro ao buscar atleta:', err);
              }
            }
            return { ...stat, atletaNome: stat.atletaNome || 'Atleta' };
          })
        );
        
        setEstatisticas(statsComNomes);
      }
    } catch (err) {
      console.error('Erro ao carregar último jogo:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-slate-900">Último Jogo</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!ultimoJogo) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-slate-900">Último Jogo</h3>
        </div>
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">Ainda não há jogos finalizados</p>
        </div>
      </div>
    );
  }

  // 👇 Determina vitória pelos resultados
  const resultadoObj = ultimoJogo.resultado || {};
  const nossos = resultadoObj.nos || 0;
  const deles = resultadoObj.adversario || 0;
  const vitoria = nossos > deles;
  
  const resultadoTexto = `${nossos} - ${deles}`;
  
  // Calcula totais das estatísticas
  const totais = estatisticas.reduce((acc, stat) => ({
    aces: acc.aces + (stat.aces || 0),
    ataques: acc.ataques + (stat.ataques || 0),
    ataquesEficazes: acc.ataquesEficazes + (stat.ataquesEficazes || 0),
    bloqueios: acc.bloqueios + (stat.bloqueios || 0),
    defesas: acc.defesas + (stat.defesas || 0),
    erros: acc.erros + (stat.erros || 0),
    errosAtaque: acc.errosAtaque + (stat.errosAtaque || 0),
    errosServico: acc.errosServico + (stat.errosServico || 0),
    pontos: acc.pontos + (stat.pontos || 0),
  }), {
    aces: 0,
    ataques: 0,
    ataquesEficazes: 0,
    bloqueios: 0,
    defesas: 0,
    erros: 0,
    errosAtaque: 0,
    errosServico: 0,
    pontos: 0,
  });

  // Encontra MVP (atleta com mais pontos)
  const mvp = estatisticas.reduce((max, stat) => 
    (stat.pontos || 0) > (max.pontos || 0) ? stat : max
  , {});

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-slate-900">Último Jogo</h3>
          </div>
          <button
            onClick={() => navigate('/jogos')}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Ver todos
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Resultado Principal */}
        <div className={`p-4 rounded-xl border-2 ${
          vitoria 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  vitoria ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {vitoria ? 'VITÓRIA' : 'DERROTA'}
                </span>
                {ultimoJogo.competicao && (
                  <span className="text-xs text-slate-600">{ultimoJogo.competicao}</span>
                )}
              </div>
              
              <p className="text-sm text-slate-600 mb-1">
                vs <span className="font-semibold text-slate-900">{ultimoJogo.adversario || 'Adversário'}</span>
              </p>
              
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-slate-900">
                  {resultadoTexto}
                </p>
                <span className="text-xs px-2 py-1 bg-white/60 rounded-full font-semibold text-slate-700">
                  {ultimoJogo.local === 'Casa' ? '🏠 Casa' : '✈️ Fora'}
                </span>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                {ultimoJogo.data ? new Date(ultimoJogo.data).toLocaleDateString('pt-PT', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : ''}
              </p>
            </div>
            
            <div className={`text-5xl ${
              vitoria ? 'text-green-600' : 'text-red-600'
            }`}>
              {vitoria ? '🏆' : '😔'}
            </div>
          </div>
        </div>

        {/* MVP */}
        {mvp.atletaNome && mvp.pontos > 0 && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-700 font-semibold mb-0.5">MVP do Jogo</p>
                <p className="font-bold text-slate-900">{mvp.atletaNome}</p>
                <p className="text-xs text-amber-600 mt-0.5">{mvp.pontos} pontos</p>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas Totais */}
        {estatisticas.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Estatísticas da Equipa
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600 mb-1">Pontos</p>
                <p className="text-xl font-bold text-slate-900">{totais.pontos}</p>
              </div>
              
              <div className="p-3 bg-emerald-50 rounded-lg text-center">
                <p className="text-xs text-emerald-700 mb-1">Aces</p>
                <p className="text-xl font-bold text-emerald-700">{totais.aces}</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-700 mb-1">Ataques</p>
                <p className="text-xl font-bold text-blue-700">{totais.ataques}</p>
                {totais.ataques > 0 && (
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    {Math.round((totais.ataquesEficazes / totais.ataques) * 100)}% eficácia
                  </p>
                )}
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-purple-700 mb-1">Bloqueios</p>
                <p className="text-xl font-bold text-purple-700">{totais.bloqueios}</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-xs text-amber-700 mb-1">Defesas</p>
                <p className="text-xl font-bold text-amber-700">{totais.defesas}</p>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-xs text-red-700 mb-1">Erros</p>
                <p className="text-xl font-bold text-red-700">{totais.erros}</p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-xs text-orange-700 mb-1">Erros Ataque</p>
                <p className="text-xl font-bold text-orange-700">{totais.errosAtaque}</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg text-center">
                <p className="text-xs text-rose-700 mb-1">Erros Serviço</p>
                <p className="text-xl font-bold text-rose-700">{totais.errosServico}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Atletas */}
        {estatisticas.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Top 3 Atletas</h4>
            <div className="space-y-2">
              {estatisticas
                .sort((a, b) => (b.pontos || 0) - (a.pontos || 0))
                .slice(0, 3)
                .map((stat, idx) => (
                  <div key={stat.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-900' :
                      'bg-orange-300 text-orange-900'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {stat.atletaNome || 'Atleta'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                        <span>{stat.pontos || 0} pts</span>
                        {stat.aces > 0 && <span>• {stat.aces} aces</span>}
                        {stat.bloqueios > 0 && <span>• {stat.bloqueios} bloq</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Observações do jogo */}
        {ultimoJogo.observacoes && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 mb-1">📝 Observações</p>
            <p className="text-xs text-slate-700 whitespace-pre-wrap">{ultimoJogo.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
