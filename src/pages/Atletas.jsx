import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const isAdmin = user?.role === "admin" || user?.role === "direcao";
  const permissions = usePermissions(user);
  const isTreinador = user?.role === "treinador";
  const equipasUser = Array.isArray(user?.equipas) ? user.equipas : [];
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
    fotoUrl: "", // NOVO
    documentos: { cc: "", exameMedico: "" },
    observacoes: "",
  });

  useEffect(() => {
    loadAtletas();
  }, []);

  useEffect(() => {
    const carregarEscaloes = async () => {
      try {
        const snap = await getDocs(collection(db, "escaloes"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => a.nome.localeCompare(b.nome));
        setEscaloes(data);
      } catch (err) {
        console.error("Erro ao carregar escalões:", err);
      }
    };

    carregarEscaloes();
  }, []);

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

  const filteredAtletas = atletas.filter((atleta) => {
    const matchTexto =
      atleta.nome?.toLowerCase().includes(search.toLowerCase()) ||
      atleta.equipa?.toLowerCase().includes(search.toLowerCase());

    // Aplicar filtro de equipa do dropdown (para admin/direção)
    const matchEscalao = filtroEscalao
      ? atleta.equipa === filtroEscalao
      : true;

    // Aplicar permissões
    const matchPermissao = permissions.canViewEquipa(atleta.equipa);

    return matchTexto && matchEscalao && matchPermissao;
  });

  const escaloesFiltrados = permissions.filterByEquipa(escaloes, 'nome');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const atletaData = {
        nome: formData.nome,
        idade: formData.idade,
        equipa: formData.equipa,
        posicao: formData.posicao,
        telefone: formData.telefone,
        email: formData.email,
        fotoUrl: formData.fotoUrl, // NOVO
        documentos: formData.documentos,
        observacoes: formData.observacoes,
      };

      if (editingAtleta) {
        const ref = doc(db, "atletas", editingAtleta.id);
        await updateDoc(ref, atletaData);
        alert("Atleta atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "atletas"), atletaData);
        alert("Atleta adicionada com sucesso!");
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

  const resetForm = () => {
    setFormData({
      nome: "",
      idade: "",
      equipa: "",
      posicao: "",
      telefone: "",
      email: "",
      documentos: { cc: "", exameMedico: "" },
      observacoes: "",
    });
  };

  // ---------- IMPORTAR DO SHEETS (CSV) ----------
  const handleImportCSV = (event) => {
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
              </p>
            </div>
          </div>

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
                <span>
                  {importing ? "A importar..." : "Importar do Sheets"}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingAtleta(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Adicionar Atleta
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Pesquisa – ocupa ~70% */}
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

            {/* Filtro – ocupa ~30% */}
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
                    {/* ... */}
                  </div>

                  <div className="space-y-2 mb-6">
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
    </div>
  );
}
