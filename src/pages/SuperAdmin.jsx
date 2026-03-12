// src/pages/SuperAdmin.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PLANOS, getPlanoFeatures } from "../constants/planos";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, authSecundaria } from "../utils/firebase";
import { Toaster, toast } from "react-hot-toast";
// Adicionar aos imports do SuperAdmin.jsx
import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, setDoc, increment, query, where,
} from "firebase/firestore";
import { nanoid } from "nanoid"; // npm install nanoid


const ROLES = [
  { id: "admin", label: "Admin" },
  { id: "direcao", label: "Direção" },
  { id: "treinador", label: "Treinador" },
  { id: "fisio", label: "Fisioterapeuta" },
  { id: "atleta", label: "Atleta" },
];

const UTILIZADOR_VAZIO = {
  nome: "", email: "", password: "",
  role: "admin", equipas: "", clubeId: "",
};

function SuperAdmin() {
  const { user } = useAuth();

  // — Estado convites —
  const [convites, setConvites] = useState([]);
  const [novoConvite, setNovoConvite] = useState({
    clubeId: "", role: "admin", equipas: "", email: "",
  });
  const [conviteLinkGerado, setConviteLinkGerado] = useState(null);

  const BASE_URL = window.location.origin; // ex: https://app.clubside.pt

  // ─────────────────────────────────────────
  // CONVITES
  // ─────────────────────────────────────────

  const gerarConvite = async () => {
    const { clubeId, role, equipas, email } = novoConvite;
    if (!clubeId) { toast.error("Seleciona um clube!"); return; }

    const loadingToast = toast.loading("A gerar convite...");
    try {
      const token = nanoid(24); // token único e seguro

      const expiraEm = new Date();
      expiraEm.setDate(expiraEm.getDate() + 7); // válido 7 dias

      await setDoc(doc(db, `clubs/${clubeId}/convites`, token), {
        token,
        clubeId,
        role,
        equipas: equipas ? equipas.split(",").map(e => e.trim()).filter(Boolean) : [],
        email: email.trim().toLowerCase() || null, // opcional
        usado: false,
        criadoEm: new Date().toISOString(),
        expiraEm: expiraEm.toISOString(),
      });

      const link = `${BASE_URL}/convite?token=${token}&clube=${clubeId}`;
      setConviteLinkGerado(link);

      toast.success("✅ Convite gerado!", { id: loadingToast });
      carregarConvitesDoClube(clubeId);

    } catch (err) {
      toast.error(`Erro: ${err.message}`, { id: loadingToast });
    }
  };

  const carregarConvitesDoClube = async (clubeId) => {
    try {
      const snap = await getDocs(collection(db, `clubs/${clubeId}/convites`));
      setConvites(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.criadoEm?.localeCompare(a.criadoEm)));
    } catch (err) {
      console.error(err);
    }
  };

  const revogarConvite = async (clubeId, token) => {
    if (!confirm("Revogar este convite?")) return;
    try {
      await deleteDoc(doc(db, `clubs/${clubeId}/convites`, token));
      toast.success("Convite revogado!");
      carregarConvitesDoClube(clubeId);
    } catch (err) {
      toast.error("Erro ao revogar");
    }
  };

  const copiarLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("🔗 Link copiado!");
  };


  // — Estado clubes —
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoClube, setNovoClube] = useState({ nome: "", slug: "", plano: "basic" });
  const [editandoClube, setEditandoClube] = useState(null);

  // — Estado utilizadores —
  const [novoUtilizador, setNovoUtilizador] = useState(UTILIZADOR_VAZIO);
  const [criarUtilizadorLoading, setCriarUtilizadorLoading] = useState(false);
  const [utilizadores, setUtilizadores] = useState([]);
  const [clubeSelecionadoVer, setClubeSelecionadoVer] = useState("");

  // — Tab activa —
  const [tab, setTab] = useState("clubes"); // "clubes" | "utilizadores"

  useEffect(() => { carregarClubes(); }, []);

  useEffect(() => {
    if (clubeSelecionadoVer) carregarUtilizadoresDoClube(clubeSelecionadoVer);
  }, [clubeSelecionadoVer]);

  // ─────────────────────────────────────────
  // CLUBES
  // ─────────────────────────────────────────

  const carregarClubes = async () => {
    try {
      const snap = await getDocs(collection(db, "clubs"));
      setClubes(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
      );
    } catch (err) {
      toast.error("Erro ao carregar clubes");
    } finally {
      setLoading(false);
    }
  };

  const criarClube = async () => {
    if (!novoClube.nome.trim() || !novoClube.slug.trim()) {
      toast.error("Nome e slug são obrigatórios!");
      return;
    }

    const loadingToast = toast.loading("A criar clube...");
    try {
      const slug = novoClube.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

      // 1. Criar doc do clube
      const clubeRef = await addDoc(collection(db, "clubs"), {
        nome: novoClube.nome.trim(),
        slug,
        plano: novoClube.plano,
        funcionalidades: getPlanoFeatures(novoClube.plano),
        ativo: true,
        createdAt: new Date().toISOString(),
        utilizadoresCount: 0,
      });

      // 2. ✅ Inicializar config base do clube
      await setDoc(doc(db, `clubs/${clubeRef.id}/config`, "geral"), {
        nome: novoClube.nome.trim(),
        slug,
        plano: novoClube.plano,
        epoca: "",
        logoUrl: "",
        corPrimaria: "#1e293b",
        corDestaque: "#3b82f6",
        createdAt: new Date().toISOString(),
      });

      toast.success(`✅ Clube "${novoClube.nome}" criado!`, { id: loadingToast });
      setNovoClube({ nome: "", slug: "", plano: "basic" });
      carregarClubes();
    } catch (err) {
      console.error(err);
      toast.error(`Erro: ${err.message}`, { id: loadingToast });
    }
  };

  const salvarClube = async () => {
    const loadingToast = toast.loading("A guardar...");
    try {
      await updateDoc(doc(db, "clubs", editandoClube.id), editandoClube);
      toast.success("✅ Clube atualizado!", { id: loadingToast });
      setEditandoClube(null);
      carregarClubes();
    } catch (err) {
      toast.error(`Erro: ${err.message}`, { id: loadingToast });
    }
  };

  const apagarClube = async (clubeId) => {
    const clube = clubes.find(c => c.id === clubeId);
    if (!confirm(`⚠️ Eliminar "${clube?.nome}"?\n\nIsto APAGA o clube e TODOS os dados!`)) return;
    const loadingToast = toast.loading("A apagar...");
    try {
      await deleteDoc(doc(db, "clubs", clubeId));
      toast.success("🗑️ Clube eliminado!", { id: loadingToast });
      carregarClubes();
    } catch (err) {
      toast.error(`Erro: ${err.message}`, { id: loadingToast });
    }
  };

  // ─────────────────────────────────────────
  // UTILIZADORES
  // ─────────────────────────────────────────

  const carregarUtilizadoresDoClube = async (clubeId) => {
    try {
      const snap = await getDocs(collection(db, `clubs/${clubeId}/utilizadores`));
      setUtilizadores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Erro ao carregar utilizadores");
    }
  };

  const criarUtilizador = async () => {
    const { nome, email, password, role, equipas, clubeId } = novoUtilizador;

    if (!nome.trim() || !email.trim() || !password.trim() || !clubeId) {
      toast.error("Nome, email, password e clube são obrigatórios!");
      return;
    }
    if (password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres!");
      return;
    }

    setCriarUtilizadorLoading(true);
    const loadingToast = toast.loading("A criar utilizador...");

    try {
      // 1. ✅ Criar conta no Firebase Auth via app secundária (não faz logout do SuperAdmin)
      const credencial = await createUserWithEmailAndPassword(
        authSecundaria, email.trim(), password
      );
      const uid = credencial.user.uid;

      // 2. ✅ Logout imediato da app secundária
      await authSecundaria.signOut();

      // 3. ✅ Criar doc em clubs/{clubeId}/utilizadores
      await setDoc(doc(db, `clubs/${clubeId}/utilizadores`, uid), {
        uid,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        role,
        equipas: equipas
          ? equipas.split(",").map(e => e.trim()).filter(Boolean)
          : [],
        clubeId,
        ativo: true,
        createdAt: new Date().toISOString(),
      });

      // 4. ✅ Incrementar contador do clube
      await updateDoc(doc(db, "clubs", clubeId), {
        utilizadoresCount: increment(1),
      });

      toast.success(`✅ Utilizador "${nome}" criado com sucesso!`, { id: loadingToast });
      setNovoUtilizador(UTILIZADOR_VAZIO);

      // Recarregar lista se estiver a ver este clube
      if (clubeSelecionadoVer === clubeId) carregarUtilizadoresDoClube(clubeId);
      carregarClubes();

    } catch (err) {
      console.error(err);
      const msg =
        err.code === "auth/email-already-in-use" ? "Este email já está registado!" :
          err.code === "auth/invalid-email" ? "Email inválido!" :
            err.code === "auth/weak-password" ? "Password demasiado fraca!" :
              err.message;
      toast.error(msg, { id: loadingToast });
    } finally {
      setCriarUtilizadorLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // GUARDS
  // ─────────────────────────────────────────

  if (!user) return <div className="flex items-center justify-center h-64">A carregar...</div>;

  if (user.role !== "superadmin") return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
      <div className="text-4xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
      <p className="text-gray-600 mb-4">Precisas de role <code>"superadmin"</code> no Firestore.</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-xl">🔄 A carregar clubes...</div>
    </div>
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🚀 SuperAdmin
        </h1>
        <p className="text-xl text-gray-600">
          {clubes.length} clube{clubes.length !== 1 ? "s" : ""} registado{clubes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {[
          { id: "clubes", label: "🏟️ Clubes" },
          { id: "utilizadores", label: "👥 Utilizadores" },
          { id: "convites", label: "🔗 Convites" }, 
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-3 font-semibold rounded-t-xl transition-all ${tab === t.id
              ? "bg-white border border-b-white border-gray-200 text-blue-600 -mb-px"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CLUBES ── */}
      {tab === "clubes" && (
        <>
          {/* Form Novo Clube */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-xl mb-10 border border-indigo-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">➕ Criar Novo Clube</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <input
                placeholder="Nome completo (ex: FC Porto Voleibol)"
                value={novoClube.nome}
                onChange={e => {
                  const nome = e.target.value;
                  const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  setNovoClube({ ...novoClube, nome, slug });
                }}
                className="p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <input
                placeholder="Slug único (ex: fc-porto-voleibol)"
                value={novoClube.slug}
                onChange={e => setNovoClube({ ...novoClube, slug: e.target.value })}
                className="p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-mono text-sm"
              />
              <select
                value={novoClube.plano}
                onChange={e => setNovoClube({ ...novoClube, plano: e.target.value })}
                className="p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              >
                {PLANOS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={criarClube}
              disabled={!novoClube.nome || !novoClube.slug}
              className="mt-6 w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-10 rounded-2xl text-lg font-bold shadow-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ✨ Criar Clube
            </button>
          </div>

          {/* Tabela Clubes */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-5 text-left font-bold text-gray-700">Clube</th>
                  <th className="p-5 text-left font-bold text-gray-700">Slug</th>
                  <th className="p-5 text-left font-bold text-gray-700">Plano</th>
                  <th className="p-5 text-left font-bold text-gray-700">Utilizadores</th>
                  <th className="p-5 text-left font-bold text-gray-700">Estado</th>
                  <th className="p-5 font-bold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clubes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-400">
                      <div className="text-4xl mb-3">🏟️</div>
                      Nenhum clube criado ainda
                    </td>
                  </tr>
                ) : clubes.map(clube => (
                  <tr key={clube.id} className="hover:bg-blue-50/40 transition-all border-t">
                    <td className="p-5 font-semibold text-gray-900">{clube.nome}</td>
                    <td className="p-5">
                      <code className="bg-blue-100 px-3 py-1 rounded-lg text-sm font-mono text-blue-700">
                        {clube.slug}
                      </code>
                    </td>
                    <td className="p-5">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold ${clube.plano === "enterprise" ? "bg-purple-100 text-purple-700" :
                        clube.plano === "pro" ? "bg-blue-100 text-blue-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                        {clube.plano?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600">
                      👥 {clube.utilizadoresCount || 0}
                    </td>
                    <td className="p-5">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold ${clube.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                        {clube.ativo ? "🟢 ATIVO" : "🔴 INATIVO"}
                      </span>
                    </td>
                    <td className="p-5 flex gap-2">
                      <button
                        onClick={() => setEditandoClube({ ...clube })}
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 text-sm font-semibold transition-all"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => apagarClube(clube.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-semibold transition-all"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "convites" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form Gerar Convite */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">🔗 Gerar Link de Convite</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Clube *</label>
                <select
                  value={novoConvite.clubeId}
                  onChange={e => {
                    setNovoConvite({ ...novoConvite, clubeId: e.target.value });
                    if (e.target.value) carregarConvitesDoClube(e.target.value);
                    setConviteLinkGerado(null);
                  }}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                >
                  <option value="">Seleciona um clube...</option>
                  {clubes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Função *</label>
                <select
                  value={novoConvite.role}
                  onChange={e => setNovoConvite({ ...novoConvite, role: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                >
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>

              {novoConvite.role === "treinador" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Equipas <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
                  </label>
                  <input
                    placeholder="Ex: Sénior Feminino, Sub-18"
                    value={novoConvite.equipas}
                    onChange={e => setNovoConvite({ ...novoConvite, equipas: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Email <span className="text-gray-400 font-normal">(opcional — pré-preenche o formulário)</span>
                </label>
                <input
                  type="email"
                  placeholder="Ex: joao@clube.pt"
                  value={novoConvite.email}
                  onChange={e => setNovoConvite({ ...novoConvite, email: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                />
              </div>

              <button
                onClick={gerarConvite}
                disabled={!novoConvite.clubeId}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl text-lg font-bold shadow-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ✨ Gerar Link de Convite
              </button>

              {/* Link gerado */}
              {conviteLinkGerado && (
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 mt-2">
                  <p className="text-xs font-semibold text-amber-600 mb-2">🔗 Link gerado (válido 7 dias):</p>
                  <p className="text-xs font-mono text-gray-600 break-all mb-3 bg-gray-50 p-2 rounded-lg">
                    {conviteLinkGerado}
                  </p>
                  <button
                    onClick={() => copiarLink(conviteLinkGerado)}
                    className="w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 transition-all text-sm"
                  >
                    📋 Copiar Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lista de convites */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Convites Gerados</h2>

            {!novoConvite.clubeId ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🔗</div>
                <p>Seleciona um clube para ver os convites</p>
              </div>
            ) : convites.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p>Nenhum convite gerado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {convites.map(c => {
                  const expirado = new Date(c.expiraEm) < new Date();
                  const link = `${BASE_URL}/convite?token=${c.token}&clube=${c.clubeId}`;
                  return (
                    <div key={c.id} className={`p-4 rounded-2xl border-2 ${c.usado ? "bg-gray-50 border-gray-200 opacity-60" :
                        expirado ? "bg-red-50 border-red-200" :
                          "bg-green-50 border-green-200"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${ROLES.find(r => r.id === c.role)?.id === "admin" ? "bg-red-100 text-red-700" :
                                ROLES.find(r => r.id === c.role)?.id === "treinador" ? "bg-blue-100 text-blue-700" :
                                  "bg-gray-100 text-gray-600"
                              }`}>
                              {ROLES.find(r => r.id === c.role)?.label || c.role}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${c.usado ? "bg-gray-200 text-gray-500" :
                                expirado ? "bg-red-100 text-red-600" :
                                  "bg-green-100 text-green-700"
                              }`}>
                              {c.usado ? "✅ Usado" : expirado ? "⏰ Expirado" : "🟢 Ativo"}
                            </span>
                          </div>
                          {c.email && <p className="text-xs text-gray-500 truncate">📧 {c.email}</p>}
                          {c.equipas?.length > 0 && <p className="text-xs text-gray-400 truncate">⚽ {c.equipas.join(", ")}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            Expira: {new Date(c.expiraEm).toLocaleDateString("pt-PT")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {!c.usado && !expirado && (
                            <button
                              onClick={() => copiarLink(link)}
                              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-all"
                            >
                              📋 Copiar
                            </button>
                          )}
                          <button
                            onClick={() => revogarConvite(c.clubeId, c.token)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-all"
                          >
                            🗑️ Revogar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── TAB UTILIZADORES ── */}
      {tab === "utilizadores" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Form Criar Utilizador */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-3xl shadow-xl border border-violet-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">👤 Criar Utilizador</h2>

            <div className="space-y-4">
              {/* Clube */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Clube *</label>
                <select
                  value={novoUtilizador.clubeId}
                  onChange={e => setNovoUtilizador({ ...novoUtilizador, clubeId: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                >
                  <option value="">Seleciona um clube...</option>
                  {clubes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nome completo *</label>
                <input
                  placeholder="Ex: João Silva"
                  value={novoUtilizador.nome}
                  onChange={e => setNovoUtilizador({ ...novoUtilizador, nome: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="Ex: joao@clube.pt"
                  value={novoUtilizador.email}
                  onChange={e => setNovoUtilizador({ ...novoUtilizador, email: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Password *</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={novoUtilizador.password}
                  onChange={e => setNovoUtilizador({ ...novoUtilizador, password: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Função *</label>
                <select
                  value={novoUtilizador.role}
                  onChange={e => setNovoUtilizador({ ...novoUtilizador, role: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                >
                  {ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Equipas (só para treinador) */}
              {novoUtilizador.role === "treinador" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Equipas <span className="text-gray-400 font-normal">(separadas por vírgula)</span>
                  </label>
                  <input
                    placeholder="Ex: Sénior Feminino, Sub-18"
                    value={novoUtilizador.equipas}
                    onChange={e => setNovoUtilizador({ ...novoUtilizador, equipas: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                  />
                </div>
              )}

              <button
                onClick={criarUtilizador}
                disabled={criarUtilizadorLoading || !novoUtilizador.nome || !novoUtilizador.email || !novoUtilizador.password || !novoUtilizador.clubeId}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-2xl text-lg font-bold shadow-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {criarUtilizadorLoading ? "⏳ A criar..." : "✨ Criar Utilizador"}
              </button>
            </div>
          </div>

          {/* Ver Utilizadores de um Clube */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">👥 Utilizadores por Clube</h2>

            <select
              value={clubeSelecionadoVer}
              onChange={e => setClubeSelecionadoVer(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all mb-6"
            >
              <option value="">Seleciona um clube para ver...</option>
              {clubes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.utilizadoresCount || 0})</option>
              ))}
            </select>

            {clubeSelecionadoVer && (
              utilizadores.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">👤</div>
                  <p>Nenhum utilizador neste clube ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {utilizadores.map(u => (
                    <div key={u.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-lg shrink-0">
                        {u.nome?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{u.nome}</p>
                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                        {u.equipas?.length > 0 && (
                          <p className="text-xs text-gray-400 truncate">{u.equipas.join(", ")}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 ${u.role === "admin" ? "bg-red-100 text-red-700" :
                        u.role === "direcao" ? "bg-orange-100 text-orange-700" :
                          u.role === "treinador" ? "bg-blue-100 text-blue-700" :
                            u.role === "fisio" ? "bg-green-100 text-green-700" :
                              "bg-gray-100 text-gray-600"
                        }`}>
                        {ROLES.find(r => r.id === u.role)?.label || u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal Editar Clube */}
      {editandoClube && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ✏️ Editar <span className="text-blue-600">{editandoClube.nome}</span>
            </h2>
            <div className="space-y-4">
              <input
                value={editandoClube.nome || ""}
                onChange={e => setEditandoClube({ ...editandoClube, nome: e.target.value })}
                placeholder="Nome do clube"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <input
                value={editandoClube.slug || ""}
                onChange={e => setEditandoClube({ ...editandoClube, slug: e.target.value })}
                placeholder="Slug"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-mono text-sm"
              />
              <select
                value={editandoClube.plano || "basic"}
                onChange={e => setEditandoClube({ ...editandoClube, plano: e.target.value })}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              >
                {PLANOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!editandoClube.ativo}
                  onChange={e => setEditandoClube({ ...editandoClube, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-800">Clube ativo</span>
              </label>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Branding</p>
              <input
                value={editandoClube.branding?.lema || ""}
                onChange={e => setEditandoClube({ ...editandoClube, branding: { ...editandoClube.branding, lema: e.target.value } })}
                placeholder="Lema"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <input
                value={editandoClube.branding?.logoUrl || ""}
                onChange={e => setEditandoClube({ ...editandoClube, branding: { ...editandoClube.branding, logoUrl: e.target.value } })}
                placeholder="URL do logo"
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cor primária</label>
                  <div className="flex items-center gap-2 border-2 border-gray-200 p-2 rounded-xl">
                    <input
                      type="color"
                      value={editandoClube.branding?.corPrimaria || "#1e293b"}
                      onChange={e => setEditandoClube({ ...editandoClube, branding: { ...editandoClube.branding, corPrimaria: e.target.value } })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-gray-600">{editandoClube.branding?.corPrimaria || "#1e293b"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cor destaque</label>
                  <div className="flex items-center gap-2 border-2 border-gray-200 p-2 rounded-xl">
                    <input
                      type="color"
                      value={editandoClube.branding?.corDestaque || "#3b82f6"}
                      onChange={e => setEditandoClube({ ...editandoClube, branding: { ...editandoClube.branding, corDestaque: e.target.value } })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-gray-600">{editandoClube.branding?.corDestaque || "#3b82f6"}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: editandoClube.branding?.corPrimaria || "#1e293b" }}>
                {editandoClube.branding?.logoUrl ? (
                  <img src={editandoClube.branding.logoUrl} alt="logo" className="h-9 w-9 rounded-full object-contain bg-white p-0.5 shrink-0" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs shrink-0">🏆</div>
                )}
                <div>
                  <p className="text-white text-sm font-semibold">{editandoClube.nome || "Nome do clube"}</p>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: editandoClube.branding?.corDestaque || "#3b82f6" }}>
                    {editandoClube.branding?.lema || "Lema do clube"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t">
              <button onClick={salvarClube} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
                💾 Guardar
              </button>
              <button onClick={() => setEditandoClube(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdmin;
