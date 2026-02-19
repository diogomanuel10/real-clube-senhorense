import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveTable from '../components/ResponsiveTable';
import { usePermissions } from '../hooks/usePermissions';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  FileText,
} from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import Papa from "papaparse";

export default function Atletas({ user }) {
  const permissions = usePermissions(user);
  const navigate = useNavigate();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [escaloes, setEscaloes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAtleta, setEditingAtleta] = useState(null);
  const [filtroEscalao, setFiltroEscalao] = useState("");
  const [importing, setImporting] = useState(false);
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

  useEffect(() => {
    if (!permissions.loading) {
      loadAtletas();
      carregarEscaloes();
    }
  }, [permissions.loading]);

  const loadAtletas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "atletas"), orderBy("nome"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Atletas carregados:", data);
      setAtletas(data);
    } catch (error) {
      console.error("Erro ao carregar atletas:", error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // FILTRAR ESCALÕES BASEADO NAS PERMISSÕES
      if (permissions.isTreinador && permissions.equipas.length > 0) {
        data = data.filter(esc => permissions.equipas.includes(esc.nome));
      }
      
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(data);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const filteredAtletas = atletas.filter((atleta) => {
    const matchTexto =
      atleta.nome?.toLowerCase().includes(search.toLowerCase()) ||
      atleta.equipa?.toLowerCase().includes(search.toLowerCase());

    const matchEscalao = filtroEscalao
      ? atleta.equipa === filtroEscalao
      : true;

    const matchPermissao = permissions.canViewEquipa(atleta.equipa);

    return matchTexto && matchEscalao && matchPermissao;
  });

  const escaloesFiltrados = permissions.filterByEquipa(escaloes, 'nome');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VERIFICAR PERMISSÃO
    if (!permissions.isAdmin && !permissions.isDirecao) {
      alert("Não tem permissão para adicionar/editar atletas");
      return;
    }

    try {
      const atletaData = {
        nome: formData.nome,
        idade: formData.idade,
        equipa: formData.equipa,
        posicao: formData.posicao,
        telefone: formData.telefone,
        email: formData.email,
        fotoUrl: formData.fotoUrl,
        documentos: formData.documentos,
        observacoes: formData.observacoes,
      };

      if (editingAtleta) {
        const ref = doc(db, "atletas", editingAtleta.id);
        await updateDoc(ref, atletaData);
        alert("Atleta atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "atletas"), atletaData);
        alert("Atleta adicionado com sucesso!");
      }

      setShowAddModal(false);
      setEditingAtleta(null);
      resetForm();
      loadAtletas();
    } catch (error) {
      console.error("Erro ao guardar atleta:", error);
      alert("Erro: " + error.message);
    }
  };

  const handleDeleteAtleta = async (atletaId) => {
    // VERIFICAR PERMISSÃO
    if (!permissions.isAdmin && !permissions.isDirecao) {
      alert("Não tem permissão para apagar atletas");
      return;
    }

    if (!confirm("Tens a certeza que queres eliminar este atleta?")) return;

    try {
      await deleteDoc(doc(db, "atletas", atletaId));
      alert("Atleta eliminado com sucesso!");
      loadAtletas();
    } catch (error) {
      console.error("Erro ao apagar atleta:", error);
      alert("Erro ao apagar: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

// Dentro do componente:
const headers = [
  { 
    key: 'numero', 
    label: '#', 
    render: (atleta) => (
      <span className="font-semibold text-[#0b1635]">{atleta.numero}</span>
    )
  },
  { 
    key: 'nome', 
    label: 'Nome',
    render: (atleta) => (
      <div>
        <p className="font-medium">{atleta.nome}</p>
        <p className="text-xs text-slate-500 md:hidden">{atleta.equipa}</p>
      </div>
    )
  },
  { 
    key: 'equipa', 
    label: 'Escalão',
    hideOnMobile: true // Já aparece no nome em mobile
  },
  { 
    key: 'posicao', 
    label: 'Posição' 
  },
  { 
    key: 'idade', 
    label: 'Idade',
    render: (atleta) => `${atleta.idade || '-'} anos`
  },
];

  const handleImportCSV = (event) => {
    // VERIFICAR PERMISSÃO
    if (!permissions.isAdmin && !permissions.isDirecao) {
      alert("Não tem permissão para importar atletas");
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          console.log("CSV lido:", rows);

          if (!Array.isArray(rows) || rows.length === 0) {
            alert("Ficheiro CSV vazio ou inválido.");
            setImporting(false);
            return;
          }

          const batch = writeBatch(db);
          const colRef = collection(db, "atletas");

          rows.forEach((row) => {
            const docRef = doc(colRef);

            const atletaData = {
              nome: row.nome || row.Nome || "",
              idade: row.idade || row.Idade || "",
              equipa: row.equipa || row.Equipa || "",
              posicao: row.posicao || row.Posição || row.Posicao || "",
              telefone: row.telefone || row.Telefone || "",
              email: row.email || row.Email || "",
              fotoUrl: row.fotoUrl || row.FotoUrl || "",
              documentos: {
                cc: row.cc || row.CC || "",
                exameMedico:
                  row.exameMedico ||
                  row["Exame Médico"] ||
                  row.ExameMedico ||
                  "",
              },
              observacoes:
                row.observacoes || row.Observacoes || row["Observações"] || "",
            };

            if (atletaData.nome) {
              batch.set(docRef, atletaData);
            }
          });

          await batch.commit();
          alert("Atletas importados com sucesso!");
          loadAtletas();
        } catch (err) {
          console.error("Erro ao importar CSV:", err);
          alert("Erro ao importar CSV: " + err.message);
        } finally {
          setImporting(false);
          event.target.value = "";
        }
      },
      error: (err) => {
        console.error("Erro PapaParse:", err);
        alert("Erro a ler o ficheiro CSV.");
        setImporting(false);
        event.target.value = "";
      },
    });
  };

  const abrirModalAdicionar = () => {
    // VERIFICAR PERMISSÃO
    if (!permissions.isAdmin && !permissions.isDirecao) {
      alert("Não tem permissão para adicionar atletas");
      return;
    }

    setEditingAtleta(null);
    resetForm();
    setShowAddModal(true);
  };

  const abrirModalEditar = (atleta, e) => {
    e.stopPropagation(); // Prevenir navegação para o perfil

    // VERIFICAR PERMISSÃO
    if (!permissions.isAdmin && !permissions.isDirecao) {
      alert("Não tem permissão para editar atletas");
      return;
    }

    setFormData({
      nome: atleta.nome || "",
      idade: atleta.idade || "",
      equipa: atleta.equipa || "",
      posicao: atleta.posicao || "",
      telefone: atleta.telefone || "",
      email: atleta.email || "",
      fotoUrl: atleta.fotoUrl || "",
      documentos: atleta.documentos || { cc: "", exameMedico: "" },
      observacoes: atleta.observacoes || "",
    });
    setEditingAtleta(atleta);
    setShowAddModal(true);
  };

  // Loading inicial de permissões
  if (permissions.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atletas</h1>
              <p className="text-sm text-gray-600">
                {filteredAtletas.length} de {atletas.length} atletas
                {permissions.isTreinador && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {permissions.equipas.length} equipa{permissions.equipas.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* BOTÕES APENAS PARA ADMIN/DIREÇÃO */}
          {(permissions.isAdmin || permissions.isDirecao) && (
            <div className="flex items-center space-x-3">
              <div>
                <input
                  id="import-csv-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleImportCSV}
                />
                <button
                  onClick={() =>
                    document.getElementById("import-csv-input").click()
                  }
                  className="btn-primary"
                  disabled={importing}
                >
                  <FileText className="w-4 h-4" />
                  <span>
                    {importing ? "A importar..." : "Importar do Sheets"}
                  </span>
                </button>
              </div>

              <button
                onClick={abrirModalAdicionar}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Adicionar Atleta
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative basis-2/3 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Procurar por nome ou equipa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="basis-1/3 w-full">
              <select
                value={filtroEscalao}
                onChange={(e) => setFiltroEscalao(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os escalões</option>
                {escaloesFiltrados.map((esc) => (
                  <option key={esc.id} value={esc.nome}>
                    {esc.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAtletas.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum atleta encontrado
            </h3>
            <p className="text-gray-600">
              {atletas.length === 0
                ? "Ainda não há atletas registados"
                : "Tenta ajustar os filtros de pesquisa"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAtletas.map((atleta) => (
              <div
                key={atleta.id}
                onClick={() => navigate(`/atletas/${atleta.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {atleta.fotoUrl ? (
                        <img
                          src={atleta.fotoUrl}
                          alt={atleta.nome}
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {atleta.nome?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">
                          {atleta.nome || "Sem nome"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {atleta.equipa || "Sem equipa"}
                        </span>
                      </div>
                    </div>

                    {/* BOTÕES DE AÇÃO APENAS PARA ADMIN/DIREÇÃO */}
                    {(permissions.isAdmin || permissions.isDirecao) && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => abrirModalEditar(atleta, e)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar atleta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAtleta(atleta.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar atleta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    {atleta.idade && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Idade:</span>
                        <span className="text-blue-600 truncate text-xs">
                          {atleta.idade}
                        </span>
                      </div>
                    )}
                    {atleta.posicao && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Posição:</span>
                        <span className="text-blue-600 truncate text-xs">
                          {atleta.posicao}
                        </span>
                      </div>
                    )}
                    {atleta.telefone && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Telemóvel:</span>
                        <span className="text-blue-600 truncate text-xs">
                          {atleta.telefone}
                        </span>
                      </div>
                    )}
                    {atleta.email && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Email:</span>
                        <span className="text-blue-600 truncate text-xs">
                          {atleta.email}
                        </span>
                      </div>
                    )}
                    {atleta.documentos?.cc && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">CC:</span>
                        <span className="font-mono text-xs">
                          {atleta.documentos.cc}
                        </span>
                      </div>
                    )}
                    {atleta.documentos?.exameMedico && (
                      <div className="flex items-center text-sm">
                        <span className="w-24 text-gray-500">Exame:</span>
                        <span className="text-xs">
                          {atleta.documentos.exameMedico}
                        </span>
                      </div>
                    )}
                    {atleta.observacoes && (
                      <div className="flex items-start text-sm mt-3 pt-3 border-t border-gray-100">
                        <span className="w-24 text-gray-500 flex-shrink-0">
                          Obs:
                        </span>
                        <span className="text-xs text-gray-600 line-clamp-2">
                          {atleta.observacoes}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {atleta.equipa || "Sem equipa"}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {atleta.posicao || "Sem posição"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL ADICIONAR/EDITAR */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAtleta ? "Editar Atleta" : "Adicionar Atleta"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idade *
                  </label>
                  <input
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipa *
                  </label>
                  <select
                    value={formData.equipa}
                    onChange={(e) => setFormData({ ...formData, equipa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Selecionar equipa</option>
                    {escaloes.map((esc) => (
                      <option key={esc.id} value={esc.nome}>
                        {esc.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição
                  </label>
                  <input
                    type="text"
                    value={formData.posicao}
                    onChange={(e) => setFormData({ ...formData, posicao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Foto
                  </label>
                  <input
                    type="url"
                    value={formData.fotoUrl}
                    onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cartão de Cidadão
                  </label>
                  <input
                    type="text"
                    value={formData.documentos.cc}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentos: { ...formData.documentos, cc: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exame Médico
                  </label>
                  <input
                    type="text"
                    value={formData.documentos.exameMedico}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentos: { ...formData.documentos, exameMedico: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAtleta ? "Guardar Alterações" : "Adicionar Atleta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
