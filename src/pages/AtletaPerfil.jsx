import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { ChevronLeft, Users, Activity, Calendar } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const positions = ["Central", "Ponta", "Distribuidora", "Líbero", "Oposta"];

export default function AtletaPerfil({ user }) {
  console.log("USER", user)
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("dados");

  // Presenças
  const [presencasAtleta, setPresencasAtleta] = useState([]);
  const [loadingPresencas, setLoadingPresencas] = useState(true);

  const [atleta, setAtleta] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    equipa: "",
    posicao: "",
    telefone: "",
    email: "",
    fotoUrl: "",
    documentos: { cc: "", exameMedico: "" },
    observacoes: "",
  });

  //Edição
  const podeEditar = user?.role == "admin";

  // Fisio – episódios
  const [episodios, setEpisodios] = useState([]);
  const [loadingFisio, setLoadingFisio] = useState(true);
  const [showNovoEpisodio, setShowNovoEpisodio] = useState(false);
  const [episodioForm, setEpisodioForm] = useState({
    dataInicio: "",
    diagnosticoFuncional: "",
    planoTratamento: "",
    restricoesTreinoJogo: "",
    previsaoRetorno: "",
    estado: "ativo",
  });

  // Fisio – sessões por episódio
  const [episodioAtivo, setEpisodioAtivo] = useState(null);
  const [sessoes, setSessoes] = useState([]);
  const [loadingSessoes, setLoadingSessoes] = useState(false);
  const [episodioParaSessao, setEpisodioParaSessao] = useState(null);
  const [sessaoForm, setSessaoForm] = useState({
    dataSessao: "",
    nota: "",
    intervencoes: "",
    dorAntes: "",
    dorDepois: "",
  });

  useEffect(() => {
    const fetchAtleta = async () => {
      try {
        const ref = doc(db, "atletas", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert("Atleta não encontrado.");
          navigate("/atletas");
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        setAtleta(data);
        setFormData({
          nome: data.nome || "",
          idade: data.idade || "",
          equipa: data.equipa || "",
          posicao: data.posicao || "",
          telefone: data.telefone || "",
          email: data.email || "",
          fotoUrl: data.fotoUrl || "",
          documentos: {
            cc: data.documentos?.cc || "",
            exameMedico: data.documentos?.exameMedico || "",
          },
          observacoes: data.observacoes || "",
        });
      } catch (err) {
        console.error("Erro ao carregar atleta:", err);
        alert("Erro ao carregar atleta.");
      } finally {
        setLoading(false);
      }
    };

    const fetchEpisodios = async () => {
      try {
        const qEpis = query(
          collection(db, "episodiosClinicos"),
          where("atletaId", "==", id),
          orderBy("dataInicio", "desc"),
        );
        const snap = await getDocs(qEpis);
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEpisodios(lista);
      } catch (err) {
        console.error("Erro ao carregar episódios:", err);
      } finally {
        setLoadingFisio(false);
      }
    };

    const fetchPresencasAtleta = async () => {
      try {
        const qPres = query(
          collection(db, "presencas"),
          where("atletaId", "==", id),
        );
        const snap = await getDocs(qPres);
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPresencasAtleta(lista);
      } catch (err) {
        console.error("Erro ao carregar presenças do atleta:", err);
      } finally {
        setLoadingPresencas(false);
      }
    };

    fetchAtleta();
    fetchEpisodios();
    fetchPresencasAtleta();
  }, [id, navigate]);

  // Carregar sessões de um episódio
  const carregarSessoes = async (episodioId) => {
    if (episodioAtivo === episodioId) {
      // se já está aberto, fecha
      setEpisodioAtivo(null);
      setSessoes([]);
      return;
    }

    setLoadingSessoes(true);
    try {
      const ref = collection(db, "episodiosClinicos", episodioId, "sessoes");
      const snap = await getDocs(query(ref, orderBy("dataSessao", "desc")));
      setSessoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setEpisodioAtivo(episodioId);
    } catch (err) {
      console.error("Erro ao carregar sessões:", err);
      alert("Erro ao carregar sessões deste episódio.");
    } finally {
      setLoadingSessoes(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const ref = doc(db, "atletas", id);
      await updateDoc(ref, formData);
      alert("Dados do atleta atualizados!");
    } catch (err) {
      console.error("Erro ao guardar atleta:", err);
      alert("Erro ao guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!atleta) {
    return (
      <DashboardLayout user={user}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">Atleta não encontrado.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/atletas")}
                  className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                    {atleta.nome?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {atleta.nome}
                    </h1>
                    <p className="text-xs text-gray-500">
                      {atleta.equipa || "Sem equipa"} ·{" "}
                      {atleta.posicao || "Sem posição"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
                <button
                  onClick={() => setTab("dados")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition ${
                    tab === "dados"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Dados
                </button>
                <button
                  onClick={() => setTab("fisio")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition ${
                    tab === "fisio"
                      ? "bg-white text-slate-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Fisioterapia
                </button>
                <button
                  onClick={() => setTab("presencas")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition ${
                    tab === "presencas"
                      ? "bg-white text-amber-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Presenças
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* TAB DADOS */}
          {tab === "dados" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6"
            >
              {/* Dados pessoais */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Dados Pessoais
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    {podeEditar ? (
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.nome || "Sem nome"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link da foto (Google Drive)
                    </label>
                    {podeEditar ? (
                    <input
                      type="url"
                      value={formData.fotoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, fotoUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://drive.google.com/uc?export=view&id=..."
                    />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.fotoUrl || "Sem nome"}
                      </p>
                    )}
                    {formData.fotoUrl && (
                      <p className="mt-1 text-xs text-gray-500">
                        A imagem será usada na lista de atletas e no perfil.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idade *
                      </label>
                      {podeEditar ? (
                      <input
                        type="number"
                        value={formData.idade}
                        onChange={(e) =>
                          setFormData({ ...formData, idade: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        min={6}
                        max={99}
                        required
                      />
                      ) : (
                      <p className="text-sm text-gray-900">
                        {formData.idade || "Sem nome"}
                      </p>
                    )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                         {podeEditar ? (
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            telefone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                          ) : (
                      <p className="text-sm text-gray-900">
                        {formData.telefone || "Sem nome"}
                      </p>
                    )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                       {podeEditar ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      />
                            ) : (
                      <p className="text-sm text-gray-900">
                        {formData.email || "Sem nome"}
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Dados desportivos */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Dados Desportivos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipa / Escalão *
                    </label>
                     {podeEditar ? (
                    <input
                      type="text"
                      value={formData.equipa}
                      onChange={(e) =>
                        setFormData({ ...formData, equipa: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                            ) : (
                      <p className="text-sm text-gray-900">
                        {formData.equipa || "Sem nome"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posição *
                    </label>
                     {podeEditar ? (
                    <select
                      value={formData.posicao}
                      onChange={(e) =>
                        setFormData({ ...formData, posicao: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione posição</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                             ) : (
                      <p className="text-sm text-gray-900">
                        {formData.posicao || "Sem nome"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Documentação */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Documentação
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cartão de Cidadão
                    </label>
                     {podeEditar ? (
                    <input
                      type="text"
                      value={formData.documentos.cc}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentos: {
                            ...formData.documentos,
                            cc: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678 9 ZZ0"
                    />
                            ) : (
                      <p className="text-sm text-gray-900">
                        {formData.documentos.cc || "Sem nome"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exame Médico (validade)
                    </label>
                     {podeEditar ? (
                    <input
                      type="date"
                      value={formData.documentos.exameMedico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentos: {
                            ...formData.documentos,
                            exameMedico: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                           ) : (
                      <p className="text-sm text-gray-900">
                        {formData.documentos.exameMedico || "Sem nome"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Observações */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Observações
                </h2>
                {podeEditar ? (
                <textarea
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Notas adicionais, lesões, alergias, etc."
                />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.observacoes || "Sem nome"}
                      </p>
                    )}
              </section>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/atletas")}
                  className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    "Guardar alterações"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB FISIO */}
          {tab === "fisio" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Departamento Médico / Fisioterapia
                  </h2>
                  <p className="text-sm text-gray-600">
                    Gestão dos episódios clínicos e histórico de lesões.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNovoEpisodio(true)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-900"
                >
                  Novo episódio clínico
                </button>
              </div>

              {/* Lista de episódios */}
              {loadingFisio ? (
                <div className="py-8 text-sm text-gray-500">
                  A carregar episódios...
                </div>
              ) : episodios.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Ainda não existem episódios clínicos registados para este
                  atleta.
                </p>
              ) : (
                <div className="space-y-3">
                  {episodios.map((ep) => (
                    <div
                      key={ep.id}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {ep.diagnosticoFuncional ||
                              "Sem diagnóstico definido"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Início: {ep.dataInicio || "-"}{" "}
                            {ep.dataAlta && `· Alta: ${ep.dataAlta}`}
                          </p>
                          {ep.restricoesTreinoJogo && (
                            <p className="text-xs text-amber-700 mt-1">
                              Restrição: {ep.restricoesTreinoJogo}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              ep.estado === "ativo"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {ep.estado === "ativo" ? "Ativo" : "Alta"}
                          </span>

                          {ep.estado === "ativo" && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    "Marcar este episódio como fechado (alta)?",
                                  )
                                )
                                  return;
                                try {
                                  const ref = doc(
                                    db,
                                    "episodiosClinicos",
                                    ep.id,
                                  );
                                  await updateDoc(ref, {
                                    estado: "alta",
                                    dataAlta: new Date()
                                      .toISOString()
                                      .slice(0, 10), // AAAA-MM-DD
                                  });
                                  // refresh lista episódios
                                  const qEpis = query(
                                    collection(db, "episodiosClinicos"),
                                    where("atletaId", "==", id),
                                    orderBy("dataInicio", "desc"),
                                  );
                                  const snap = await getDocs(qEpis);
                                  setEpisodios(
                                    snap.docs.map((d) => ({
                                      id: d.id,
                                      ...d.data(),
                                    })),
                                  );
                                } catch (err) {
                                  console.error(
                                    "Erro ao fechar episódio:",
                                    err,
                                  );
                                  alert("Erro ao fechar episódio clínico");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              Fechar episódio
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => carregarSessoes(ep.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            {episodioAtivo === ep.id
                              ? "Esconder sessões"
                              : "Ver sessões"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEpisodioParaSessao(ep.id);
                              setSessaoForm({
                                dataSessao: "",
                                nota: "",
                                intervencoes: "",
                                dorAntes: "",
                                dorDepois: "",
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs hover:bg-slate-900"
                          >
                            Nova sessão
                          </button>
                        </div>
                      </div>

                      {episodioAtivo === ep.id && (
                        <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                          {loadingSessoes ? (
                            <p className="text-xs text-slate-500">
                              A carregar sessões...
                            </p>
                          ) : sessoes.length === 0 ? (
                            <p className="text-xs text-slate-500">
                              Ainda sem sessões registadas.
                            </p>
                          ) : (
                            sessoes.map((s) => (
                              <div
                                key={s.id}
                                className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2"
                              >
                                <p className="font-semibold">
                                  {s.dataSessao || "Sem data"}{" "}
                                  {s.responsavel && (
                                    <span>· {s.responsavel}</span>
                                  )}
                                </p>
                                {typeof s.dorAntes === "number" && (
                                  <p className="text-[11px] text-slate-500">
                                    Dor antes: {s.dorAntes}/10{" "}
                                    {typeof s.dorDepois === "number" &&
                                      `· depois: ${s.dorDepois}/10`}
                                  </p>
                                )}
                                {s.nota && <p className="mt-1">{s.nota}</p>}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Modal NOVO EPISÓDIO */}
              {showNovoEpisodio && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                  <div
                    className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                      <h3 className="text-sm font-semibold text-white">
                        Novo episódio clínico
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowNovoEpisodio(false)}
                        className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data de início
                        </label>
                        <input
                          type="date"
                          value={episodioForm.dataInicio}
                          onChange={(e) =>
                            setEpisodioForm({
                              ...episodioForm,
                              dataInicio: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diagnóstico funcional
                        </label>
                        <textarea
                          rows={2}
                          value={episodioForm.diagnosticoFuncional}
                          onChange={(e) =>
                            setEpisodioForm({
                              ...episodioForm,
                              diagnosticoFuncional: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: Entorse tibiotársica direita grau II"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Plano de tratamento
                        </label>
                        <textarea
                          rows={3}
                          value={episodioForm.planoTratamento}
                          onChange={(e) =>
                            setEpisodioForm({
                              ...episodioForm,
                              planoTratamento: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: 2–3 sessões/semana, reforço proprioceptivo..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Restrições ao treino/jogo
                        </label>
                        <input
                          type="text"
                          value={episodioForm.restricoesTreinoJogo}
                          onChange={(e) =>
                            setEpisodioForm({
                              ...episodioForm,
                              restricoesTreinoJogo: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: Sem salto, sem bloqueio, apenas parte técnica"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Previsão de retorno
                        </label>
                        <input
                          type="text"
                          value={episodioForm.previsaoRetorno}
                          onChange={(e) =>
                            setEpisodioForm({
                              ...episodioForm,
                              previsaoRetorno: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: 3–4 semanas"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNovoEpisodio(false)}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await addDoc(collection(db, "episodiosClinicos"), {
                              atletaId: id,
                              ...episodioForm,
                              estado: "ativo",
                              criadoEm: new Date().toISOString(),
                            });
                            setShowNovoEpisodio(false);
                            setEpisodioForm({
                              dataInicio: "",
                              diagnosticoFuncional: "",
                              planoTratamento: "",
                              restricoesTreinoJogo: "",
                              previsaoRetorno: "",
                              estado: "ativo",
                            });
                            const qEpis = query(
                              collection(db, "episodiosClinicos"),
                              where("atletaId", "==", id),
                              orderBy("dataInicio", "desc"),
                            );
                            const snap = await getDocs(qEpis);
                            setEpisodios(
                              snap.docs.map((d) => ({ id: d.id, ...d.data() })),
                            );
                          } catch (err) {
                            console.error("Erro ao criar episódio:", err);
                            alert("Erro ao criar episódio clínico");
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-[#f5c623] hover:bg-[#e0b91f] text-[#0b1635] text-sm font-semibold"
                      >
                        Guardar episódio
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal NOVA SESSÃO */}
              {episodioParaSessao && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                  <div
                    className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900">
                      <h3 className="text-sm font-semibold text-white">
                        Nova sessão de fisioterapia
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEpisodioParaSessao(null)}
                        className="text-slate-300 hover:text-white hover:bg-slate-700 rounded-full p-1.5 transition"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-6 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data da sessão
                        </label>
                        <input
                          type="date"
                          value={sessaoForm.dataSessao}
                          onChange={(e) =>
                            setSessaoForm({
                              ...sessaoForm,
                              dataSessao: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nota / conteúdo da sessão
                        </label>
                        <textarea
                          rows={3}
                          value={sessaoForm.nota}
                          onChange={(e) =>
                            setSessaoForm({
                              ...sessaoForm,
                              nota: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: Mobilização, reforço proprioceptivo, corrida leve..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Intervenções (opcional)
                        </label>
                        <input
                          type="text"
                          value={sessaoForm.intervencoes}
                          onChange={(e) =>
                            setSessaoForm({
                              ...sessaoForm,
                              intervencoes: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          placeholder="Ex: Tec. manual, exercício X, Y, Z"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dor antes (0–10)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={sessaoForm.dorAntes}
                            onChange={(e) =>
                              setSessaoForm({
                                ...sessaoForm,
                                dorAntes: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dor depois (0–10)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={sessaoForm.dorDepois}
                            onChange={(e) =>
                              setSessaoForm({
                                ...sessaoForm,
                                dorDepois: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEpisodioParaSessao(null)}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const refSessoes = collection(
                              db,
                              "episodiosClinicos",
                              episodioParaSessao,
                              "sessoes",
                            );
                            await addDoc(refSessoes, {
                              ...sessaoForm,
                              dorAntes:
                                sessaoForm.dorAntes !== ""
                                  ? Number(sessaoForm.dorAntes)
                                  : null,
                              dorDepois:
                                sessaoForm.dorDepois !== ""
                                  ? Number(sessaoForm.dorDepois)
                                  : null,
                              createdAt: new Date().toISOString(),
                            });

                            // recarrega sessões do episódio ativo
                            await carregarSessoes(episodioParaSessao);
                            setEpisodioParaSessao(null);
                          } catch (err) {
                            console.error("Erro ao criar sessão:", err);
                            alert("Erro ao criar sessão de fisioterapia");
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-[#f5c623] hover:bg-[#e0b91f] text-[#0b1635] text-sm font-semibold"
                      >
                        Guardar sessão
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "presencas" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Presenças em treinos
                  </h2>
                  <p className="text-sm text-gray-600">
                    Histórico de presenças, faltas e justificações desta atleta.
                  </p>
                </div>
              </div>

              {loadingPresencas ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-6">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  A carregar presenças...
                </div>
              ) : presencasAtleta.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ainda não existem registos de presenças para esta atleta.
                </p>
              ) : (
                <div className="space-y-2">
                  {presencasAtleta
                    .slice()
                    .sort((a, b) => (b.data || "").localeCompare(a.data || ""))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Treino: {p.treinoId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.data
                              ? new Date(p.data).toLocaleString("pt-PT", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })
                              : "Sem data registada"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            p.estado === "presente"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.estado === "falta"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.estado === "presente"
                            ? "Presente"
                            : p.estado === "falta"
                              ? "Falta"
                              : "Justificada"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
