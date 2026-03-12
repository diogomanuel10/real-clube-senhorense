import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { PLANOS, getPlanoFeatures } from "../constants/planos";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { Toaster, toast } from "react-hot-toast";

function SuperAdmin() {
  // ✅ TODOS OS HOOKS NO TOPO
  const { user } = useAuth();
  const { isAdmin } = usePermissions(user);
  const [clubes, setClubes] = useState([]);
  const [novoClube, setNovoClube] = useState({
    nome: "",
    slug: "",
    plano: "basic",
  });
  const [editandoClube, setEditandoClube] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ useEffect PRIMEIRO (antes das funções)
  useEffect(() => {
    carregarClubes();
  }, []);

  // ✅ FUNÇÕES DEPOIS do useEffect (ordem correta)
  const carregarClubes = async () => {
    try {
      const snap = await getDocs(collection(db, "clubs"));
      setClubes(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) =>
          (a.nome || "").localeCompare(b.nome || "")
        )
      );
    } catch (error) {
      console.error("Erro ao carregar clubes:", error);
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

    try {
      await addDoc(collection(db, "clubs"), {
        nome: novoClube.nome.trim(),
        slug: novoClube.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        plano: novoClube.plano,
        funcionalidades: getPlanoFeatures(novoClube.plano),
        ativo: true,
        createdAt: new Date().toISOString(),
        utilizadoresCount: 0,
      });
      toast.success(`✅ Clube "${novoClube.nome}" criado!`);
      setNovoClube({ nome: "", slug: "", plano: "basic" });
      carregarClubes();
    } catch (error) {
      console.error("Erro ao criar clube:", error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const editarClube = (clube) => {
    setEditandoClube({ ...clube });
  };

  const salvarClube = async () => {
    try {
      await updateDoc(doc(db, "clubs", editandoClube.id), editandoClube);
      toast.success("✅ Clube atualizado!");
      setEditandoClube(null);
      carregarClubes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  const apagarClube = async (clubeId) => {
    if (!confirm(`⚠️ Eliminar "${clubes.find(c => c.id === clubeId)?.nome}"?\n\nIsto APAGA o clube e TODOS os dados associados!`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "clubs", clubeId));
      toast.success("🗑️ Clube eliminado!");
      carregarClubes();
    } catch (error) {
      console.error("Erro ao apagar:", error);
      toast.error(`Erro: ${error.message}`);
    }
  };

  // ✅ Verificações DEPOIS de todas as funções
  if (!user) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (user.role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <div className="text-4xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-4">Precisas de role <code>"superadmin"</code> no Firestore.</p>
        <p className="text-sm text-gray-500">Vai ao Firestore → utilizadores → teu doc → adiciona <code>role: "superadmin"</code></p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">🔄 Carregando clubes...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🚀 SuperAdmin
        </h1>
        <p className="text-xl text-gray-600">
          Gestão completa de clubes • Total: <strong>{clubes.length}</strong>
        </p>
      </div>

      {/* Form Novo Clube */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-2xl mb-12 border border-indigo-200">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">➕ Criar Novo Clube</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <input
            placeholder="Nome completo (ex: FC Porto Voleibol)"
            value={novoClube.nome}
            onChange={(e) => setNovoClube({ ...novoClube, nome: e.target.value })}
            className="p-5 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <input
            placeholder="Slug único (ex: fc-porto-voleibol)"
            value={novoClube.slug}
            onChange={(e) => setNovoClube({ ...novoClube, slug: e.target.value })}
            className="p-5 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
          />
          <select
            value={novoClube.plano}
            onChange={(e) =>
              setNovoClube({ ...novoClube, plano: e.target.value })
            }
            className="p-3 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm"
          >
            {PLANOS.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={criarClube}
          disabled={!novoClube.nome || !novoClube.slug}
          className="mt-10 w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 px-12 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          ✨ Criar Clube Agora
        </button>
      </div>

      {/* Tabela Clubes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th className="p-6 text-left font-bold text-lg text-gray-800">Clube</th>
              <th className="p-6 text-left font-bold text-lg text-gray-800">Identificador</th>
              <th className="p-6 text-left font-bold text-lg text-gray-800">Plano</th>
              <th className="p-6 text-left font-bold text-lg text-gray-800">Estado</th>
              <th className="p-6 font-bold text-lg text-gray-800">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clubes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">Nenhum clube criado</h3>
                  <p className="text-gray-500">Usa o formulário acima para criar o primeiro!</p>
                </td>
              </tr>
            ) : (
              clubes.map((clube) => (
                <tr key={clube.id} className="hover:bg-blue-50/50 transition-all border-b last:border-b-0">
                  <td className="p-6 font-semibold text-gray-900">{clube.nome}</td>
                  <td className="p-6">
                    <code className="bg-blue-100 px-4 py-2 rounded-xl text-sm font-mono">
                      {clube.slug}
                    </code>
                  </td>
                  <td className="p-6">
                    <span className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-sm ${clube.plano === 'enterprise' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      clube.plano === 'pro' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                      {clube.plano?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-sm ${clube.ativo
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                      {clube.ativo ? '🟢 ATIVO' : '🔴 INATIVO'}
                    </span>
                  </td>
                  <td className="p-6 space-x-3">
                    <button
                      onClick={() => editarClube(clube)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => apagarClube(clube.id)}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      🗑️ Apagar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal de Edição (igual ao anterior, mas com melhor styling) */}
      {editandoClube && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              ✏️ Editar <span className="text-blue-600">{editandoClube.nome}</span>
            </h2>
            <div className="space-y-4">

              {/* — DADOS GERAIS — */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dados gerais</p>

              <input
                value={editandoClube.nome || ""}
                onChange={(e) => setEditandoClube({ ...editandoClube, nome: e.target.value })}
                placeholder="Nome do clube"
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={editandoClube.slug || ""}
                onChange={(e) => setEditandoClube({ ...editandoClube, slug: e.target.value })}
                placeholder="Slug (único)"
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editandoClube.plano || "basic"}
                onChange={(e) => setEditandoClube({ ...editandoClube, plano: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              >
                {PLANOS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={!!editandoClube.ativo}
                  onChange={(e) => setEditandoClube({ ...editandoClube, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-800">Clube ativo</span>
              </label>

              {/* — BRANDING — */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Branding</p>

              <input
                value={editandoClube.branding?.lema || ""}
                onChange={(e) => setEditandoClube({
                  ...editandoClube,
                  branding: { ...editandoClube.branding, lema: e.target.value }
                })}
                placeholder="Lema (ex: Vontade de vencer)"
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={editandoClube.branding?.epoca || ""}
                onChange={(e) => setEditandoClube({
                  ...editandoClube,
                  branding: { ...editandoClube.branding, epoca: e.target.value }
                })}
                placeholder="Época (ex: 25/26)"
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={editandoClube.branding?.logoUrl || ""}
                onChange={(e) => setEditandoClube({
                  ...editandoClube,
                  branding: { ...editandoClube.branding, logoUrl: e.target.value }
                })}
                placeholder="URL do logo (ex: https://...)"
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              />

              {/* Cores */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cor primária (sidebar)</label>
                  <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-xl">
                    <input
                      type="color"
                      value={editandoClube.branding?.corPrimaria || "#1e293b"}
                      onChange={(e) => setEditandoClube({
                        ...editandoClube,
                        branding: { ...editandoClube.branding, corPrimaria: e.target.value }
                      })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-gray-600">
                      {editandoClube.branding?.corPrimaria || "#1e293b"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cor de destaque (hover)</label>
                  <div className="flex items-center gap-2 border border-gray-200 p-2 rounded-xl">
                    <input
                      type="color"
                      value={editandoClube.branding?.corDestaque || "#3b82f6"}
                      onChange={(e) => setEditandoClube({
                        ...editandoClube,
                        branding: { ...editandoClube.branding, corDestaque: e.target.value }
                      })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-gray-600">
                      {editandoClube.branding?.corDestaque || "#3b82f6"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview em tempo real */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: editandoClube.branding?.corPrimaria || "#1e293b" }}
              >
                {editandoClube.branding?.logoUrl ? (
                  <img
                    src={editandoClube.branding.logoUrl}
                    alt="logo"
                    className="h-9 w-9 rounded-full object-contain bg-white p-0.5 shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs shrink-0">
                    🏆
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-semibold">
                    {editandoClube.nome || "Nome do clube"}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: editandoClube.branding?.corDestaque || "#3b82f6" }}
                  >
                    {editandoClube.branding?.lema || "Lema do clube"}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex gap-4 mt-12 pt-8 border-t">
              <button
                onClick={salvarClube}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                💾 Salvar Alterações
              </button>
              <button
                onClick={() => setEditandoClube(null)}
                className="flex-1 bg-gray-200 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
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
