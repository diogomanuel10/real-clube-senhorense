import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useJogoLive } from '../hooks/useJogoLive';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Save,
  RotateCcw,
  Users,
  Edit,
  BarChart3
} from 'lucide-react';

import Placar from '../components/JogoLive/Placar';
import Analytics from '../components/JogoLive/Analytics';
import BotoesGerais from '../components/JogoLive/BotoesGerais';
import CardAtleta from '../components/JogoLive/CardAtleta';
import ModalAcoes from '../components/JogoLive/ModalAcoes';

export default function JogoLive({ user }) {
  const { jogoId } = useParams();
  const permissions = usePermissions(user);
  const navigate = useNavigate();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [atletaSelecionado, setAtletaSelecionado] = useState(null);
  const {
    jogo,
    atletas,
    loading,
    historico,
    setAtual,
    setSetAtual,
    atletasEmCampo,
    resultadoTemp,
    setResultadoTemp,
    stats,
    registarAcao,
    registarAcaoGeral,
    desfazerUltima,
    toggleAtletaEmCampo,
    atualizarResultado,
    adicionarPonto,
    resetarSetEPlacar,
    finalizarJogo,
  } = useJogoLive(jogoId);

  const [showSubstituicoes, setShowSubstituicoes] = useState(false);
  const [showEditarResultado, setShowEditarResultado] = useState(false);
  const [resultadoEdit, setResultadoEdit] = useState({ nos: 0, adversario: 0 });

  if (permissions.loading || loading || !jogo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!permissions.isAdmin && !permissions.isDirecao && !permissions.isTreinador) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sem Permissão</h2>
          <p className="text-gray-400">Apenas treinadores podem aceder a esta página</p>
        </div>
      </div>
    );
  }

  const atletasNoCampo = atletas.filter((a) => atletasEmCampo.includes(a.id));
  const atletasNoBanco = atletas.filter((a) => !atletasEmCampo.includes(a.id));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/jogos')}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">

              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
              >
                <BarChart3 className="w-5 h-5" />
              </button>

              <select
                value={setAtual}
                onChange={(e) => {
                  const novoSet = Number(e.target.value);
                  if (novoSet !== setAtual) {
                    resetarSetEPlacar(novoSet);
                  }
                }}
                className="px-3 py-2 bg-gray-700 rounded-lg text-sm font-bold"
              >
                <option value={1}>Set 1</option>
                <option value={2}>Set 2</option>
                <option value={3}>Set 3</option>
                <option value={4}>Set 4</option>
                <option value={5}>Set 5</option>
              </select>

              <button
                onClick={() => setShowSubstituicoes(!showSubstituicoes)}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
              >
                <Users className="w-5 h-5" />
              </button>

              <button
                onClick={desfazerUltima}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={finalizarJogo}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Finalizar
              </button>
            </div>
          </div>

          <Placar
            jogo={jogo}
            resultado={resultadoTemp}
            onEditarResultado={() => {
              setResultadoEdit(resultadoTemp);
              setShowEditarResultado(true);
            }}
            onAtualizarPontos={(equipa, valor) => adicionarPonto(equipa, valor)} // ← MUDA AQUI
          />

        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* BOTÕES GERAIS */}
        <BotoesGerais
          onErroEquipa={() => registarAcaoGeral('erro_equipa')}
          onErroAdversario={() => registarAcaoGeral('erro_adversario')}
          onPontoAdversario={() => registarAcaoGeral('ponto_adversario')}
        />

        {/* ATLETAS */}
        {atletasNoCampo.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhum atleta em campo</h3>
            <p className="text-gray-400 mb-6">Seleciona 7 atletas titulares</p>
            <button
              onClick={() => setShowSubstituicoes(true)}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold"
            >
              <Users className="w-5 h-5 inline mr-2" />
              Selecionar Atletas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-400">
              Em Campo ({atletasNoCampo.length}/7)
            </h2>

            {atletasNoCampo.map((atleta) => (
              <CardAtleta
                key={atleta.id}
                atleta={atleta}
                stats={stats}
                onClick={setAtletaSelecionado}
              />
            ))}


            {atletasNoBanco.length > 0 && (
              <div className="pt-6 border-t border-gray-700">
                <h2 className="text-lg font-bold text-gray-400 mb-3">
                  No Banco ({atletasNoBanco.length})
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {atletasNoBanco.map((atleta) => (
                    <div
                      key={atleta.id}
                      className="bg-gray-800 p-3 rounded-lg text-sm opacity-60"
                    >
                      <div className="font-bold">{atleta.nome}</div>
                      <div className="text-xs text-gray-500">
                        {stats[atleta.id]?.pontos || 0} pts •{' '}
                        {stats[atleta.id]?.erros || 0} erros
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL AÇÕES ATLETA */}
      {atletaSelecionado && (
        <ModalAcoes
          atleta={atletaSelecionado}
          onClose={() => setAtletaSelecionado(null)}
          onRegistarAcao={registarAcao}
        />
      )}


      {/* MODAL ANALYTICS */}
      {showAnalytics && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowAnalytics(false)}
        >
          <div
            className="bg-gray-900 rounded-2xl w-full max-w-6xl p-6 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">📊 Analytics do Jogo</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <Analytics
              stats={stats}
              historico={historico}
              setAtual={setAtual}
              jogo={jogo}
              resultado={resultadoTemp}
            />
          </div>
        </div>
      )}

      {/* MODAL EDITAR RESULTADO */}
      {showEditarResultado && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEditarResultado(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Editar Resultado</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {jogo.equipa}
                </label>
                <input
                  type="number"
                  min="0"
                  value={resultadoEdit.nos}
                  onChange={(e) =>
                    setResultadoEdit({
                      ...resultadoEdit,
                      nos: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-2xl font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {jogo.adversario}
                </label>
                <input
                  type="number"
                  min="0"
                  value={resultadoEdit.adversario}
                  onChange={(e) =>
                    setResultadoEdit({
                      ...resultadoEdit,
                      adversario: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg text-2xl font-bold text-center"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditarResultado(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  atualizarResultado(resultadoEdit);
                  setShowEditarResultado(false);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUBSTITUIÇÕES */}
      {showSubstituicoes && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSubstituicoes(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Gerir Atletas</h2>
            <p className="text-sm text-gray-400 mb-4">
              Seleciona 7 titulares ({atletasEmCampo.length}/7)
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {atletas.map((atleta) => {
                const emCampo = atletasEmCampo.includes(atleta.id);
                return (
                  <button
                    key={atleta.id}
                    onClick={() => toggleAtletaEmCampo(atleta.id)}
                    className={`p-4 rounded-lg text-left transition ${emCampo
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <div className="font-bold">{atleta.nome}</div>
                    <div className="text-xs opacity-75">
                      {stats[atleta.id]?.pontos || 0} pts •{' '}
                      {stats[atleta.id]?.erros || 0} erros
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSubstituicoes(false)}
              className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
