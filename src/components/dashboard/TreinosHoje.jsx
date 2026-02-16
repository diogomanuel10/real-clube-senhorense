import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, CalendarDays, ChevronRight, ClipboardCheck, FileText, X, Check } from 'lucide-react';
import { getTreinosHoje, formatarHoraTreino } from '../../utils/DashboardUtils';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const TreinosHoje = ({ treinos, escaloes, loading }) => {
  const navigate = useNavigate();
  const treinosHoje = getTreinosHoje(treinos);
  const [selectedTreino, setSelectedTreino] = useState(null);
  const [showPresencasModal, setShowPresencasModal] = useState(false);
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [atletas, setAtletas] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [loadingAtletas, setLoadingAtletas] = useState(false);
  const [savingPresencas, setSavingPresencas] = useState(false);

  // Carregar atletas quando abrir modal de presenças
  const abrirModalPresencas = async (treino) => {
    setSelectedTreino(treino);
    setShowPresencasModal(true);
    setLoadingAtletas(true);

    try {
      // Carregar atletas da equipa
      const q = query(
        collection(db, 'atletas'),
        where('equipa', '==', treino.equipa)
      );
      const snapshot = await getDocs(q);
      const atletasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      atletasData.sort((a, b) => a.nome.localeCompare(b.nome));
      setAtletas(atletasData);

      // Carregar presenças já registadas para este treino
      const presencasQuery = query(
        collection(db, 'presencas'),
        where('treinoId', '==', treino.id)
      );
      const presencasSnap = await getDocs(presencasQuery);
      const presencasObj = {};
      presencasSnap.docs.forEach(doc => {
        const data = doc.data();
        presencasObj[data.atletaId] = {
          presente: data.presente,
          docId: doc.id
        };
      });
      setPresencas(presencasObj);
    } catch (error) {
      console.error('Erro ao carregar atletas:', error);
      alert('Erro ao carregar atletas');
    } finally {
      setLoadingAtletas(false);
    }
  };

  const abrirModalPlano = (treino) => {
    setSelectedTreino(treino);
    setShowPlanoModal(true);
  };

  const togglePresenca = (atletaId) => {
    setPresencas(prev => ({
      ...prev,
      [atletaId]: {
        ...prev[atletaId],
        presente: !prev[atletaId]?.presente
      }
    }));
  };

  const guardarPresencas = async () => {
    if (!selectedTreino) return;
    
    setSavingPresencas(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Guardar cada presença
      for (const atleta of atletas) {
        const presente = presencas[atleta.id]?.presente || false;
        const docId = presencas[atleta.id]?.docId;

        if (docId) {
          // Atualizar existente
          await updateDoc(doc(db, 'presencas', docId), {
            presente,
            updatedAt: new Date()
          });
        } else {
          // Criar nova
          await addDoc(collection(db, 'presencas'), {
            treinoId: selectedTreino.id,
            atletaId: atleta.id,
            atletaNome: atleta.nome,
            equipa: selectedTreino.equipa,
            data: hoje,
            presente,
            createdAt: new Date()
          });
        }
      }

      alert('Presenças guardadas com sucesso!');
      setShowPresencasModal(false);
    } catch (error) {
      console.error('Erro ao guardar presenças:', error);
      alert('Erro ao guardar presenças');
    } finally {
      setSavingPresencas(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Treinos de Hoje</h2>
              <p className="text-sm text-slate-500">
                {treinosHoje.length} {treinosHoje.length === 1 ? 'treino marcado' : 'treinos marcados'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/treinos')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Ver calendário
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Treinos */}
        {treinosHoje.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">Sem treinos hoje</p>
            <p className="text-sm text-slate-500">Não existem treinos marcados para hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {treinosHoje.map((treino) => {
              const escalao = escaloes.find(e => e.nome === treino.equipa);
              const cor = escalao?.cor || "from-slate-400 to-slate-500";

              return (
                <div
                  key={treino.id}
                  className={`
                    relative overflow-hidden rounded-xl border border-slate-200
                    bg-gradient-to-r ${cor} p-4
                    hover:shadow-md transition-all duration-200
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        {treino.equipa}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">
                            {formatarHoraTreino(treino.horaInicio, treino.horaFim)}
                          </span>
                        </div>
                        
                        {treino.local && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{treino.local}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirModalPlano(treino)}
                        className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Plano
                      </button>
                      <button
                        onClick={() => abrirModalPresencas(treino)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        Presenças
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Presenças */}
      {showPresencasModal && selectedTreino && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Marcar Presenças</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedTreino.equipa} • {formatarHoraTreino(selectedTreino.horaInicio, selectedTreino.horaFim)}
                </p>
              </div>
              <button
                onClick={() => setShowPresencasModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lista de Atletas */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAtletas ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : atletas.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum atleta nesta equipa</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {atletas.map((atleta) => {
                    const presente = presencas[atleta.id]?.presente || false;
                    return (
                      <button
                        key={atleta.id}
                        onClick={() => togglePresenca(atleta.id)}
                        className={`
                          w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between
                          ${presente 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                            ${presente ? 'bg-green-500' : 'bg-slate-400'}
                          `}>
                            {atleta.nome?.charAt(0) || '?'}
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-slate-900">{atleta.nome}</p>
                            {atleta.posicao && (
                              <p className="text-sm text-slate-500">{atleta.posicao}</p>
                            )}
                          </div>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${presente ? 'border-green-500 bg-green-500' : 'border-slate-300'}
                        `}>
                          {presente && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {Object.values(presencas).filter(p => p.presente).length} de {atletas.length} presentes
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPresencasModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarPresencas}
                  disabled={savingPresencas}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingPresencas ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      A guardar...
                    </>
                  ) : (
                    'Guardar Presenças'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Plano de Treino */}
      {showPlanoModal && selectedTreino && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Plano de Treino</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedTreino.equipa} • {formatarHoraTreino(selectedTreino.horaInicio, selectedTreino.horaFim)}
                </p>
              </div>
              <button
                onClick={() => setShowPlanoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do Plano */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTreino.planoTreino ? (
                <div className="space-y-6">
                  {/* Objetivo */}
                  {selectedTreino.planoTreino.objetivo && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Objetivo do Treino</h3>
                      <p className="text-slate-900 bg-blue-50 p-4 rounded-lg">
                        {selectedTreino.planoTreino.objetivo}
                      </p>
                    </div>
                  )}

                  {/* Aquecimento */}
                  {selectedTreino.planoTreino.aquecimento && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">🔥 Aquecimento</h3>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {selectedTreino.planoTreino.aquecimento}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Parte Principal */}
                  {selectedTreino.planoTreino.partePrincipal && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">💪 Parte Principal</h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {selectedTreino.planoTreino.partePrincipal}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Retorno à Calma */}
                  {selectedTreino.planoTreino.retornoCalma && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">🧘 Retorno à Calma</h3>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {selectedTreino.planoTreino.retornoCalma}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  {selectedTreino.planoTreino.observacoes && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">📝 Observações</h3>
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {selectedTreino.planoTreino.observacoes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Material Necessário */}
                  {selectedTreino.planoTreino.material && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">🏐 Material Necessário</h3>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-slate-900 whitespace-pre-wrap">
                          {selectedTreino.planoTreino.material}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-1">Sem plano de treino</p>
                  <p className="text-sm text-slate-500">Ainda não foi definido um plano para este treino</p>
                  <button
                    onClick={() => {
                      setShowPlanoModal(false);
                      navigate('/treinos');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adicionar Plano
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPlanoModal(false)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TreinosHoje;

