// src/pages/Escaloes.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import { Users, Plus, Activity, DollarSign, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import ModalAtleta from "../components/atletas/ModalAtleta";
import { useNavigate } from "react-router-dom";

export default function Escaloes({ user }) {
  const [escaloes, setEscaloes] = useState([]);
  const [escalaoSelecionado, setEscalaoSelecionado] = useState(null);
  const [dadosEscalao, setDadosEscalao] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 👇 Só carrega a LISTA de escalões (super leve - 1 query)
  useEffect(() => {
    carregarListaEscaloes();
  }, []);

  const [showModalNovoAtleta, setShowModalNovoAtleta] = useState(false);
  const carregarListaEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, 'escaloes'));
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(lista);
    } catch (err) {
      console.error('Erro ao carregar escalões:', err);
    }
  };

  const handleSubmitAtleta = async (e, formData) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "atletas"), {
        ...formData,
        createdAt: new Date(),
      });

      alert("Atleta criado com sucesso!");
      setShowModalNovoAtleta(false);

      // Recarrega dados do escalão
      if (escalaoSelecionado) {
        await selecionarEscalao(escalaoSelecionado);
      }
    } catch (err) {
      console.error("Erro ao criar atleta:", err);
      alert("Erro: " + err.message);
    }
  };


  // 👇 Só carrega dados QUANDO clica num escalão (lazy load!)
  const selecionarEscalao = async (escalao) => {
    setEscalaoSelecionado(escalao);
    setLoading(true);


    try {
      const hoje = new Date();
      const data30Dias = new Date(hoje);
      data30Dias.setDate(hoje.getDate() - 30);
      const data30ISO = data30Dias.toISOString().slice(0, 10);
      const hojeISO = hoje.toISOString().slice(0, 10);

      // 👇 4 queries em paralelo SÓ para este escalão
      const [atletasSnap, treinosSnap, presencasSnap, quotasSnap, utilizadoresSnap] = await Promise.all([
        getDocs(query(collection(db, 'atletas'), where('equipa', '==', escalao.nome))),
        getDocs(query(collection(db, 'treinos'), where('equipa', '==', escalao.nome))),
        getDocs(collection(db, 'presencas')),
        getDocs(collection(db, 'quotas')),
        getDocs(query(collection(db, 'utilizadores'), where('role', '==', 'treinador'))) // 👈 BUSCA TREINADORES
      ]);

      const atletas = atletasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todosTreinos = treinosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todasPresencas = presencasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const todasQuotas = quotasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const todosUtilizadores = utilizadoresSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const treinadores = todosUtilizadores.filter(u =>
        u.equipas && u.equipas.includes(escalao.nome)
      );
      // Filtrar treinos dos últimos 30 dias
      const treinos30Dias = todosTreinos.filter(t =>
        t.data >= data30ISO && t.data <= hojeISO
      );
      const treinosIds = treinos30Dias.map(t => t.id);

      // Calcular assiduidade
      const presencas30Dias = todasPresencas.filter(p =>
        treinosIds.includes(p.treinoId) && p.estado === 'presente'
      );

      const totalPossivel = treinos30Dias.length * atletas.length;
      const taxaAssiduidade = totalPossivel > 0
        ? Math.round((presencas30Dias.length / totalPossivel) * 100)
        : 0;

      // Quotas pendentes deste escalão
      const atletasIds = atletas.map(a => a.id);
      const quotasPendentes = todasQuotas.filter(q =>
        !q.pago && atletasIds.includes(q.atletaId)
      );

      // Quotas em atraso
      const quotasEmAtraso = quotasPendentes.filter(q =>
        q.dataVencimento && q.dataVencimento < hojeISO
      );

      // Atletas com assiduidade baixa
      const atletasComProblemas = atletas.filter(atleta => {
        const presencasAtleta = todasPresencas.filter(p =>
          p.atletaId === atleta.id &&
          treinosIds.includes(p.treinoId) &&
          p.estado === 'presente'
        );

        const totalTreinos = treinos30Dias.length;
        const taxaPresenca = totalTreinos > 0
          ? (presencasAtleta.length / totalTreinos) * 100
          : 100;

        return taxaPresenca < 60 && totalTreinos > 0;
      }).length;

      // Próximo treino
      const proximoTreino = todosTreinos
        .filter(t => t.data >= hojeISO)
        .sort((a, b) => a.data.localeCompare(b.data))[0];


      setDadosEscalao({
        atletas,
        treinadores,
        metricas: {
          totalAtletas: atletas.length,
          taxaAssiduidade,
          quotasPendentes: quotasPendentes.length,
          quotasEmAtraso: quotasEmAtraso.length,
          atletasComProblemas,
          proximoTreino,
          totalTreinos30Dias: treinos30Dias.length
        }
      });

    } catch (err) {
      console.error('Erro ao carregar dados do escalão:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Escalões</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Seleciona um escalão para ver detalhes, métricas e atletas.
        </p>
      </header>

      <main className="px-4 sm:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* 👈 COLUNA ESQUERDA: Lista de escalões */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              {/* 👇 Título alinhado com os botões */}
              <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
                Seleciona o escalão
              </h3>

              <div className="space-y-2">
                {escaloes.map(esc => (
                  <button
                    key={esc.id}
                    onClick={() => selecionarEscalao(esc)}
                    disabled={loading && escalaoSelecionado?.id === esc.id}
                    className={`
                    w-full text-left border rounded-xl px-4 py-3
                    bg-gradient-to-r ${esc.cor || 'from-slate-50 to-slate-100 border-slate-200'}
                    transition-all duration-200
                    ${escalaoSelecionado?.id === esc.id
                        ? 'ring-2 ring-slate-900 shadow-md'
                        : 'hover:shadow-md hover:-translate-y-0.5'
                      }
                    disabled:opacity-50 disabled:cursor-wait
                  `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center text-sm font-bold text-slate-800 shadow-sm flex-shrink-0">
                          {esc.nome?.split(" ")[0].charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {esc.nome}
                          </p>

                        </div>
                      </div>

                      {/* Loading spinner */}
                      {loading && escalaoSelecionado?.id === esc.id && (
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 👉 COLUNA DIREITA: Detalhes do escalão */}
          <div className="lg:col-span-8 xl:col-span-9">
            {!escalaoSelecionado ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
                <div className="text-5xl sm:text-6xl mb-4">👈</div>
                <p className="text-base sm:text-lg font-semibold text-slate-900 mb-2 text-center">
                  Seleciona um escalão
                </p>
                <p className="text-xs sm:text-sm text-slate-500 text-center">
                  Clica num escalão à esquerda para ver métricas e atletas
                </p>
              </div>
            ) : loading ? (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-white border border-slate-200 rounded-2xl">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-600 px-4">
                    A carregar dados de <span className="font-semibold">{escalaoSelecionado.nome}</span>...
                  </p>
                </div>
              </div>
            ) : dadosEscalao ? (
              <div className="space-y-4">
                {/* 📊 Cards de métricas - Responsivo */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Assiduidade */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className={`text-2xl sm:text-3xl font-bold ${dadosEscalao.metricas.taxaAssiduidade >= 80 ? 'text-green-600' :
                        dadosEscalao.metricas.taxaAssiduidade >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {dadosEscalao.metricas.taxaAssiduidade}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Assiduidade</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Últimos 30 dias</p>
                  </div>

                  {/* Quotas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      <span className={`text-2xl sm:text-3xl font-bold ${dadosEscalao.metricas.quotasPendentes === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {dadosEscalao.metricas.quotasPendentes}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Quotas pendentes</p>
                    {dadosEscalao.metricas.quotasEmAtraso > 0 && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                        {dadosEscalao.metricas.quotasEmAtraso} em atraso
                      </p>
                    )}
                  </div>

                  {/* Problemas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {dadosEscalao.metricas.atletasComProblemas}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Assiduidade baixa</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Menos de 60%</p>
                  </div>

                  {/* Total atletas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {dadosEscalao.metricas.totalAtletas}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Total atletas</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ativos</p>
                  </div>
                </div>

                {/* 🎯 Ações rápidas - Responsivo */}
                {/* 🎯 Ações rápidas - Responsivo */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-3">Ações rápidas</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      onClick={() => navigate(`/treinos?escalao=${escalaoSelecionado.nome}`)}
                      className="flex flex-col items-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-medium text-slate-900">Ver treinos</span>
                    </button>

                    <button
                      onClick={() => navigate(`/quotas?escalao=${escalaoSelecionado.nome}`)}
                      className="flex flex-col items-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition"
                    >
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      <span className="text-xs font-medium text-slate-900">Ver quotas</span>
                    </button>

                    <button
                      onClick={() => setShowModalNovoAtleta(true)}
                      className="flex flex-col items-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition"
                    >
                      <Plus className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-medium text-slate-900">Novo atleta</span>
                    </button>

                    {/* 👇 Usa o mesmo modal */}
                    <ModalAtleta
                      show={showModalNovoAtleta}
                      onClose={() => setShowModalNovoAtleta(false)}
                      escaloes={escaloes}
                      editingAtleta={
                        escalaoSelecionado ? {
                          equipa: escalaoSelecionado.nome,
                          documentos: { cc: "", exameMedico: "" } // 👈 Adiciona isto
                        } : null
                      }
                      onSubmit={handleSubmitAtleta}
                    />

                    <button
                      className="flex flex-col items-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-medium text-slate-900">Relatório</span>
                    </button>
                  </div>
                </div>


                {/* Grid responsivo para treinador + atletas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 👤 Treinador */}

                  <div className="bg-white border border-slate-200 rounded-xl p-4 lg:col-span-2">
                    <p className="text-xs font-semibold text-slate-600 mb-3">
                      Treinadores ({dadosEscalao.treinadores?.length || 0})
                    </p>

                    {!dadosEscalao.treinadores || dadosEscalao.treinadores.length === 0 ? (
                      <p className="text-sm text-slate-400 px-3 py-2.5 bg-slate-50 rounded-lg">
                        Sem treinadores atribuídos
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {dadosEscalao.treinadores.map((treinador) => (
                          <div
                            key={treinador.id}
                            className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition"
                          >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {treinador.nome?.charAt(0) || treinador.email?.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {treinador.nome || treinador.email}
                              </p>
                              {treinador.email && (
                                <p className="text-xs text-slate-500 truncate">
                                  ✉️ {treinador.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* 👥 Lista de atletas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 lg:col-span-2">
                    <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Atletas do escalão ({dadosEscalao.atletas.length})
                    </p>

                    {dadosEscalao.atletas.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        Nenhum atleta neste escalão
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {dadosEscalao.atletas.map(atleta => (
                          <button
                            key={atleta.id}
                            onClick={() => navigate(`/atletas/${atleta.id}`)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-sm transition text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
                              {atleta.nome?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {atleta.nome}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {atleta.posicao || "Sem posição"}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
