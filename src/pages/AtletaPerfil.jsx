import { useEffect, useState } from "react";
import PreparacaoFisicaTab from "../components/preparacao-fisica/PreparacaoFisicaTab";
import FisioterapiaTab from "../components/fisioterapia/FisioterapiaTab";
import { useParams, useNavigate } from "react-router-dom";
import AcademicTab from "../components/atletas/AcademicTab"; // ajusta o path
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
import { db } from "../utils/firebase";
import { ChevronLeft, Users, Activity, Calendar, Dumbbell, GraduationCap } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const positions = ["Central", "Ponta", "Distribuidora", "Líbero", "Oposta"];

export default function AtletaPerfil({ user }) {
  console.log("USER", user);
  const { id } = useParams();
  const navigate = useNavigate();
  const tabs = [
    { id: 'dados', label: 'Dados Pessoais' },
    { id: 'fisioterapia', label: 'Fisioterapia' },
    { id: 'preparacao-fisica', label: 'Preparação Física' },
    { id: "academico", label: "Académico" }, // NOVO
    { id: 'documentos', label: 'Documentos' },
    { id: 'historico', label: 'Histórico' }
  ];

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

  // Edição
  const podeEditar = user?.role === "admin";

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
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(qPres);

        const lista = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();
            let treino = null;

            if (data.treinoId) {
              const treinoSnap = await getDoc(doc(db, "treinos", data.treinoId));
              if (treinoSnap.exists()) {
                treino = { id: treinoSnap.id, ...treinoSnap.data() };
              }
            }

            return {
              id: d.id,
              ...data,
              treino,
            };
          })
        );

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
  }, [id, navigate]); // [file:30]

  // Carregar sessões de um episódio
  const carregarSessoes = async (episodioId) => {
    if (episodioAtivo === episodioId) {
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
      console.error("Erro ao carregar sessões", err);
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
        {/* HEADER RESPONSIVO */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    {atleta.nome}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {atleta.equipa || "Sem equipa"} •{" "}
                    {atleta.posicao || "Sem posição"}
                  </p>
                </div>
              </div>
            </div>

            {/* TABS RESPONSIVAS */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setTab("dados")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition whitespace-nowrap ${tab === "dados"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Users className="w-4 h-4" />
                Dados
              </button>
              <button
                onClick={() => setTab("academico")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition whitespace-nowrap ${tab === "academico"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <GraduationCap className="w-4 h-4" />
                Académico
              </button>
              <button
                onClick={() => setTab("fisio")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition whitespace-nowrap ${tab === "fisio"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Activity className="w-4 h-4" />
                Fisioterapia
              </button>
              <button
                onClick={() => setTab("preparacao-fisica")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition whitespace-nowrap ${tab === "preparacao-fisica"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Dumbbell className="w-4 h-4" />
                Prep. Física
              </button>
              <button
                onClick={() => setTab("presencas")}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition whitespace-nowrap ${tab === "presencas"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Calendar className="w-4 h-4" />
                Presenças
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* TAB DADOS */}
          {tab === "dados" && (
            <form
              onSubmit={handleSave}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6"
            >
              {/* Dados pessoais */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://drive.google.com/uc?export=view&id=..."
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.fotoUrl || "Sem link"}
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
                            setFormData({
                              ...formData,
                              idade: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          min={6}
                          max={99}
                          required
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {formData.idade || "Sem idade"}
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
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {formData.telefone || "Sem telefone"}
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
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">
                          {formData.email || "Sem email"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Dados desportivos */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
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
                          setFormData({
                            ...formData,
                            equipa: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.equipa || "Sem equipa"}
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
                          setFormData({
                            ...formData,
                            posicao: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
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
                        {formData.posicao || "Sem posição"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Documentação */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="12345678 9 ZZ0"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.documentos.cc || "Sem CC"}
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
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">
                        {formData.documentos.exameMedico || "Sem exame"}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Observações */}
              <section className="border-t border-gray-100 pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Observações
                </h2>
                {podeEditar ? (
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observacoes: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Notas adicionais, lesões, alergias, etc."
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {formData.observacoes || "Sem observações"}
                  </p>
                )}
              </section>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/atletas")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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

          {tab === "academico" && (
            <AcademicTab athleteId={atleta.id} />
          )}

          {/* TAB FISIO */}
          {tab === "fisio" && <FisioterapiaTab atleta={atleta} user={user} />}

          {tab === "preparacao-fisica" && (
            <PreparacaoFisicaTab atleta={atleta} user={user} />
          )}

          {/* TAB PRESENÇAS */}
          {tab === "presencas" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4">
              {/* ← NOVO: KPIs DE ATRASOS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-slate-100 rounded-xl border border-orange-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-700">{presencasAtleta.filter(p => p.estado === 'presente').length}</p>
                  <p className="text-xs text-orange-800 uppercase tracking-wide">Presentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {presencasAtleta.filter(p => p.estado === 'atraso').length}
                  </p>
                  <p className="text-xs text-orange-700 uppercase tracking-wide">Atrasos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{presencasAtleta.filter(p => p.estado === 'falta').length}</p>
                  <p className="text-xs text-red-500 uppercase tracking-wide">Faltas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {Math.round(presencasAtleta.length > 0 ?
                      (presencasAtleta.filter(p => p.estado === 'presente' || p.estado === 'atraso').length / presencasAtleta.length * 100) : 0)}%
                  </p>
                  <p className="text-xs text-amber-500 uppercase tracking-wide">Assiduidade</p>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Histórico de Presenças
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Últimos treinos desta atleta (ordenados por data).
                </p>
              </div>

              {loadingPresencas ? (
                <p className="text-sm text-slate-500">A carregar presenças...</p>
              ) : presencasAtleta.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ainda não existem registos de presenças para esta atleta.
                </p>
              ) : (
                <div className="space-y-2">
                  {presencasAtleta.map((p) => {
                    const dataTreino =
                      p.treino?.dataTreino ||
                      (p.createdAt?.toDate ? p.createdAt.toDate() : null);

                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {p.treino?.equipa || 'Treino sem detalhes'}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-500">
                            {p.createdAt?.toDate
                              ? p.createdAt.toDate().toLocaleString("pt-PT", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                              : "Sem data registada"
                            }
                          </p>
                        </div>

                        {/* ← STATUS COM ATRASO */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${p.estado === "presente"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.estado === "atraso"
                              ? "bg-orange-100 text-orange-800"
                              : p.estado === "falta"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                            {p.estado === "presente" && "Presente"}
                            {p.estado === "atraso" && "⏰ Atraso"}
                            {p.estado === "falta" && "❌ Falta"}
                            {p.estado === "justificada" && "✅ Justificada"}
                          </span>

                          {/* ← MOSTRAR MINUTOS DE ATRASO */}
                          {p.estado === "atraso" && p.atrasoMinutos && (
                            <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                              {p.atrasoMinutos} min
                            </span>
                          )}
                        </div>
                      </div>

                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </DashboardLayout>
  );
}
