import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { ChevronDown, ChevronRight, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Escaloes({ user }) {
  const [escaloes, setEscaloes] = useState([]);
  const navigate = useNavigate();
  const [treinadores, setTreinadores] = useState([]);
  const [openEscalao, setOpenEscalao] = useState(null);
  const [atletasPorEscalao, setAtletasPorEscalao] = useState({});
  const [loadingEscalao, setLoadingEscalao] = useState({});
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [escalaoSelecionado, setEscalaoSelecionado] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const CORES_ESCALAO = [
    { label: "Azul claro", value: "from-sky-50 to-sky-100 border-sky-200" },
    { label: "Azul escuro", value: "from-blue-50 to-blue-100 border-blue-200" },
    {
      label: "Indigo",
      value: "from-indigo-50 to-indigo-100 border-indigo-200",
    },
    { label: "Roxo", value: "from-violet-50 to-violet-100 border-violet-200" },
    {
      label: "Magenta",
      value: "from-fuchsia-50 to-fuchsia-100 border-fuchsia-200",
    },
    { label: "Rosa", value: "from-rose-50 to-rose-100 border-rose-200" },
    { label: "Vermelho", value: "from-red-50 to-red-100 border-red-200" },
    {
      label: "Laranja",
      value: "from-orange-50 to-orange-100 border-orange-200",
    },
    { label: "Âmbar", value: "from-amber-50 to-amber-100 border-amber-200" },
    {
      label: "Amarelo",
      value: "from-yellow-50 to-yellow-100 border-yellow-200",
    },
    { label: "Lima", value: "from-lime-50 to-lime-100 border-lime-200" },
    { label: "Verde", value: "from-green-50 to-green-100 border-green-200" },
    {
      label: "Verde esmeralda",
      value: "from-emerald-50 to-emerald-100 border-emerald-200",
    },
    { label: "Ciano", value: "from-cyan-50 to-cyan-100 border-cyan-200" },
    { label: "Cinza", value: "from-slate-50 to-slate-100 border-slate-200" },
  ];

  const [novoEscalao, setNovoEscalao] = useState({
    nome: "",
    cor: CORES_ESCALAO[0].value,
    horario: "",
    observacoes: "",
  });

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        if (!user?.uid && !user?.email) return;

        const qPerf = query(
          collection(db, "utilizadores"),
          where("email", "==", user.email),
          // ou where("uid","==",user.uid) se guardas o uid
        );
        const snap = await getDocs(qPerf);
        if (!snap.empty) {
          const d = snap.docs[0];
          setPerfil({ id: d.id, ...d.data() });
        }
      } catch (err) {
        console.error("Erro ao carregar perfil do utilizador:", err);
      } finally {
        setLoadingPerfil(false);
      }
    };

    carregarPerfil();
  }, [user]);

  function EscalaoDetalhe({ escalao, treinador, atletas, loading }) {
    return (
      <div className="bg-white/80 border border-slate-200 rounded-2xl px-5 py-4 space-y-4 shadow-sm">
        {/* Treinador */}
        <div className="pb-3 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Treinador
          </label>
          {treinador ? (
            <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0b1635] flex items-center justify-center text-white text-sm font-semibold">
                {treinador.nome?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {treinador.nome}
                </p>
                {treinador.telefone && (
                  <p className="text-xs text-slate-500">
                    📱 {treinador.telefone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 px-3 py-2 bg-white rounded-xl border border-slate-200">
              Sem treinador atribuído
            </p>
          )}
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Observações do escalão
          </label>
          <textarea
            readOnly
            defaultValue={escalao.observacoes || ""}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white/80"
            rows={2}
          />
        </div>

        {/* Atletas */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center">
            <Users className="w-3 h-3 mr-1" />
            Atletas do escalão
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : atletas.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhum atleta neste escalão.
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {atletas.map((at) => (
                <button
                  key={at.id}
                  type="button"
                  onClick={() => navigate(`/atletas/${at.id}`)}
                  className="w-full text-left"
                >
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-100 text-xs
                 hover:border-slate-400 hover:shadow-sm transition"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-700">
                        {at.nome?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 truncate max-w-[160px]">
                          {at.nome}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {at.posicao || "Sem posição"} · {at.idade || "-"} anos
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <p>{at.telefone || "-"}</p>
                      <p className="truncate max-w-[120px]">{at.email || ""}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (loadingPerfil) return; // espera pelo perfil
    carregarEscaloes();
    carregarTreinadores();
  }, [loadingPerfil]);

  const carregarTreinadores = async () => {
    try {
      const snap = await getDocs(collection(db, "treinadores"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTreinadores(lista);
    } catch (err) {
      console.error("Erro ao carregar treinadores:", err);
    }
  };

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const equipasUser =
        perfil?.role === "treinador" ? perfil.equipas || [] : [];

      if (equipasUser.length > 0 && perfil?.role === "treinador") {
        data = data.filter((esc) => equipasUser.includes(esc.nome));
      }

      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(data);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const toggleEscalao = async (escalao) => {
    const novo = openEscalao === escalao.id ? null : escalao.id;
    setOpenEscalao(novo);

    if (!novo) return;
    if (atletasPorEscalao[escalao.id]) return;

    setLoadingEscalao((prev) => ({ ...prev, [escalao.id]: true }));
    try {
      const snap = await getDocs(
        collection(db, "atletas"),
        // se quiseres filtrar por equipa==escalao.nome, troca para query+where
      );
      // filtra no cliente por enquanto
      const atletas = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((a) => a.equipa === escalao.nome);

      setAtletasPorEscalao((prev) => ({ ...prev, [escalao.id]: atletas }));
    } catch (err) {
      console.error("Erro ao carregar atletas do escalão:", err);
    } finally {
      setLoadingEscalao((prev) => ({ ...prev, [escalao.id]: false }));
    }
  };

  const handleCriarEscalao = async (e) => {
    e.preventDefault();
    if (!novoEscalao.nome.trim()) {
      alert("Nome do escalão é obrigatório.");
      return;
    }

    try {
      await addDoc(collection(db, "escaloes"), novoEscalao);
      setShowNovoModal(false);
      setNovoEscalao({
        nome: "",
        cor: "from-slate-50 to-slate-100 border-slate-200",
        horario: "",
        observacoes: "",
      });
      await carregarEscaloes();
    } catch (err) {
      console.error("Erro ao criar escalão:", err);
      alert("Erro ao criar escalão: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escalões</h1>
          <p className="text-sm text-slate-500">
            Visão geral por escalão, atletas, horários e observações.
          </p>
        </div>

        <button
          onClick={() => setShowNovoModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Escalão</span>
        </button>
      </header>

      <main className="px-8 pb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna esquerda: lista de escalões */}
          <div className="lg:col-span-1 space-y-4">
            {escaloes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ainda não existem escalões.
              </p>
            ) : (
              escaloes.map((esc) => {
                const selecionado = escalaoSelecionado?.id === esc.id;
                const atletas = atletasPorEscalao[esc.id] || [];
                const loading = loadingEscalao[esc.id];

                return (
                  <button
                    key={esc.id}
                    type="button"
                    onClick={() => {
                      setEscalaoSelecionado(esc); // guarda o escalão
                      toggleEscalao(esc); // se ainda quiseres abrir/fechar, ou podes simplificar
                    }}
                    className={`w-full text-left border rounded-2xl bg-gradient-to-r ${
                      esc.cor || "from-slate-50 to-slate-100 border-slate-200"
                    } shadow-sm px-5 py-4 flex items-center justify-between transition ${
                      selecionado
                        ? "ring-2 ring-slate-900/40"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-sm font-semibold text-slate-800 shadow-sm">
                        {esc.nome?.split(" ")[0].charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {esc.nome}
                        </p>
                        <p className="text-xs text-slate-600">
                          {atletasPorEscalao[esc.id]
                            ? `${atletasPorEscalao[esc.id].length} atletas`
                            : "Atletas por carregar"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col text-right text-[11px] text-slate-600">
                      <span>Horário treino</span>
                      <span className="font-medium text-slate-800">
                        {esc.horario || "A definir"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Coluna direita: detalhe do escalão selecionado */}
          <div className="lg:col-span-2">
            {!escalaoSelecionado ? (
              <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white">
                <p className="text-sm text-slate-500">
                  Seleciona um escalão à esquerda para veres o treinador e os
                  atletas.
                </p>
              </div>
            ) : (
              <EscalaoDetalhe
                escalao={escalaoSelecionado}
                treinador={treinadores.find(
                  (t) => t.escalaoId === escalaoSelecionado.id,
                )}
                atletas={atletasPorEscalao[escalaoSelecionado.id] || []}
                loading={loadingEscalao[escalaoSelecionado.id]}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modal Novo Escalão */}
      {showNovoModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNovoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Novo Escalão
            </h2>

            <form onSubmit={handleCriarEscalao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome do escalão *
                </label>
                <input
                  type="text"
                  value={novoEscalao.nome}
                  onChange={(e) =>
                    setNovoEscalao({ ...novoEscalao, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Juniores F"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Horário de treino
                </label>
                <input
                  type="text"
                  value={novoEscalao.horario}
                  onChange={(e) =>
                    setNovoEscalao({ ...novoEscalao, horario: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2ª e 5ª · 18:00–19:30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cor do escalão
                </label>
                <select
                  value={novoEscalao.cor}
                  onChange={(e) =>
                    setNovoEscalao({ ...novoEscalao, cor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CORES_ESCALAO.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observações
                </label>
                <textarea
                  value={novoEscalao.observacoes}
                  onChange={(e) =>
                    setNovoEscalao({
                      ...novoEscalao,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Notas gerais sobre o escalão"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm font-medium hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium"
                >
                  Criar escalão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
