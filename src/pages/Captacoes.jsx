import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { UserPlus, Filter, Plus, Pencil, Trash2, X, Eye } from "lucide-react";

export default function Captacoes() {
  const [captacoes, setCaptacoes] = useState([]);
  const [escaloes, setEscaloes] = useState([]);
  const [filtroEscalao, setFiltroEscalao] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [captacaoSelecionada, setCaptacaoSelecionada] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroAprovacao, setFiltroAprovacao] = useState("todos");

  const [form, setForm] = useState({
    nome: "",
    idade: "",
    escalao: "",
    telemovel: "",
    email: "",
    encarregadoNome: "",        
    encarregadoTelefone: "",
    exClubes: "",
    anosVoleibol: "",
    pontosPositivos: "",
    pontosNegativos: "",
    interesse: "neutro",
    aprovadoDirecao: "pendente",
    dataRegisto: new Date().toISOString(),
    observacoes: "",
  });

  useEffect(() => {
    carregarCaptacoes();
    carregarEscaloes();
  }, []);

  const carregarCaptacoes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "captacoes"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => new Date(b.dataRegisto) - new Date(a.dataRegisto));
      setCaptacoes(lista);
    } catch (err) {
      console.error("Erro ao carregar captações:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEscaloes(lista);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const abrirModalAdicionar = () => {
    setForm({
      nome: "",
      idade: "",
      escalao: "",
      telemovel: "",
      email: "",
      encarregadoNome: "",        // ✅ NOVO
      encarregadoTelefone: "",    // ✅ NOVO
      exClubes: "",
      anosVoleibol: "",
      pontosPositivos: "",
      pontosNegativos: "",
      interesse: "neutro",
      aprovadoDirecao: "pendente",
      dataRegisto: new Date().toISOString(),
      observacoes: "",
    });
    setModoEdicao(false);
    setCaptacaoSelecionada(null);
    setShowModal(true);
  };

  const abrirModalEditar = (captacao) => {
    setForm({
      nome: captacao.nome || "",
      idade: captacao.idade || "",
      escalao: captacao.escalao || "",
      telemovel: captacao.telemovel || "",
      email: captacao.email || "",
      encarregadoNome: captacao.encarregadoNome || "",        // ✅ NOVO
    encarregadoTelefone: captacao.encarregadoTelefone || "", // ✅ NOVO
      exClubes: captacao.exClubes || "",
      anosVoleibol: captacao.anosVoleibol || "",
      pontosPositivos: captacao.pontosPositivos || "",
      pontosNegativos: captacao.pontosNegativos || "",
      interesse: captacao.interesse || "neutro",
      aprovadoDirecao: captacao.aprovadoDirecao || "pendente",
      dataRegisto: captacao.dataRegisto || new Date().toISOString(),
      observacoes: captacao.observacoes || "",
    });
    setModoEdicao(true);
    setCaptacaoSelecionada(captacao);
    setShowModal(true);
  };

  const abrirDetalhes = (captacao) => {
    setCaptacaoSelecionada(captacao);
    setShowDetalhesModal(true);
  };

  const guardarCaptacao = async (e) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.idade || !form.escalao) {
      alert("Nome, idade e escalão são obrigatórios");
      return;
    }

    try {
      if (modoEdicao && captacaoSelecionada) {
        await updateDoc(doc(db, "captacoes", captacaoSelecionada.id), form);
      } else {
        await addDoc(collection(db, "captacoes"), form);
      }

      setShowModal(false);
      carregarCaptacoes();
    } catch (err) {
      console.error("Erro ao guardar captação:", err);
      alert("Erro ao guardar: " + err.message);
    }
  };

  const apagarCaptacao = async (id) => {
    if (!confirm("Tens a certeza que queres eliminar esta captação?")) return;

    try {
      await deleteDoc(doc(db, "captacoes", id));
      carregarCaptacoes();
    } catch (err) {
      console.error("Erro ao apagar captação:", err);
      alert("Erro ao apagar: " + err.message);
    }
  };

const captacoesFiltradas = captacoes.filter((cap) => {
  if (filtroStatus !== "todos" && cap.interesse !== filtroStatus) return false;
  if (filtroAprovacao !== "todos" && cap.aprovadoDirecao !== filtroAprovacao) return false;
  if (filtroEscalao !== "todos" && cap.escalao !== filtroEscalao) return false; // ✅ ADICIONA ESTA LINHA
  return true;
});


  const getBadgeInteresse = (interesse) => {
    switch (interesse) {
      case "interessado":
        return "bg-emerald-100 text-emerald-700";
      case "neutro":
        return "bg-amber-100 text-amber-700";
      case "nao-interessado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const getBadgeAprovacao = (aprovacao) => {
    switch (aprovacao) {
      case "sim":
        return "bg-blue-100 text-blue-700";
      case "nao":
        return "bg-red-100 text-red-700";
      case "pendente":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-6 h-6 text-[#0b1635]" />
            <h1 className="text-2xl font-bold text-slate-900">Captações</h1>
          </div>
          <p className="text-sm text-slate-600">
            Avaliação e acompanhamento de novos atletas
          </p>
        </div>
        <button
          onClick={abrirModalAdicionar}
          className="flex items-center gap-2 px-4 py-2 bg-[#0b1635] text-white rounded-xl font-medium hover:bg-[#152452] transition"
        >
          <Plus className="w-4 h-4" />
          Nova Captação
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Interesse do Treinador
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="interessado">Interessado</option>
              <option value="neutro">Neutro</option>
              <option value="nao-interessado">Não Interessado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Aprovação Direção
            </label>
            <select
              value={filtroAprovacao}
              onChange={(e) => setFiltroAprovacao(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="sim">Aprovado</option>
              <option value="nao">Rejeitado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          {/* Dentro da secção de Filtros, adiciona isto depois do filtro "Aprovação Direção": */}

<div>
  <label className="block text-xs font-medium text-slate-600 mb-1">
    Escalão
  </label>
  <select
    value={filtroEscalao}
    onChange={(e) => setFiltroEscalao(e.target.value)}
    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
  >
    <option value="todos">Todos os escalões</option>
    {escaloes.map((esc) => (
      <option key={esc.id} value={esc.nome}>
        {esc.nome}
      </option>
    ))}
  </select>
</div>


          <div className="flex items-end">
           <button
  onClick={() => {
    setFiltroStatus("todos");
    setFiltroAprovacao("todos");
    setFiltroEscalao("todos"); // ✅ ADICIONA ESTA LINHA
  }}
  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900"
>
  Limpar filtros
</button>

          </div>
        </div>
      </div>

      {/* Lista de captações */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : captacoesFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma captação encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {captacoesFiltradas.map((cap) => (
            <div
              key={cap.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition"
            >
              {/* Header do card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0b1635] flex items-center justify-center text-white font-semibold">
                    {cap.nome?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cap.nome}</h3>
                    <p className="text-xs text-slate-500">
                      {cap.idade} anos · {cap.escalao}
                    </p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeInteresse(cap.interesse)}`}
                >
                  {cap.interesse === "interessado"
                    ? "Interessado"
                    : cap.interesse === "neutro"
                    ? "Neutro"
                    : "Não Interessado"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeAprovacao(cap.aprovadoDirecao)}`}
                >
                  {cap.aprovadoDirecao === "sim"
                    ? "✓ Aprovado"
                    : cap.aprovadoDirecao === "nao"
                    ? "✗ Rejeitado"
                    : "⏳ Pendente"}
                </span>
              </div>

              {/* Info resumida */}
<div className="space-y-1 text-xs text-slate-600 mb-4">
  {cap.anosVoleibol && (
    <p>🏐 {cap.anosVoleibol} anos de voleibol</p>
  )}
  {cap.exClubes && <p>🏛️ {cap.exClubes}</p>}
  {cap.telemovel && <p>📱 {cap.telemovel}</p>}
  {/* ✅ NOVO */}
  {cap.encarregadoNome && (
    <p>👤 Enc.: {cap.encarregadoNome}</p>
  )}
</div>


              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => abrirDetalhes(cap)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition"
                >
                  <Eye className="w-3 h-3" />
                  Ver
                </button>
                <button
                  onClick={() => abrirModalEditar(cap)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => apagarCaptacao(cap.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {modoEdicao ? "Editar Captação" : "Nova Captação"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Preenche os dados do atleta para avaliação
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={guardarCaptacao} className="p-6 space-y-4">
              {/* Informações Básicas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Idade *
                    </label>
                    <input
                      type="number"
                      value={form.idade}
                      onChange={(e) => setForm({ ...form, idade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Escalão Pretendido *
                  </label>
                  <select
                    value={form.escalao}
                    onChange={(e) => setForm({ ...form, escalao: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    required
                  >
                    <option value="">Selecionar escalão</option>
                    {escaloes.map((esc) => (
                      <option key={esc.id} value={esc.nome}>
                        {esc.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Telemóvel *
                    </label>
                    <input
                      type="tel"
                      value={form.telemovel}
                      onChange={(e) => setForm({ ...form, telemovel: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                      placeholder="912 345 678"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                      placeholder="atleta@email.com"
                    />
                  </div>
                </div>
                {/* Depois do grid com Telemóvel e Email, adiciona isto: */}

{/* Encarregado de Educação */}
<div className="space-y-3 pt-3 border-t">
  <h3 className="text-sm font-semibold text-slate-700">
    Encarregado de Educação
  </h3>

  <div className="grid grid-cols-2 gap-3">
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Nome do Encarregado
      </label>
      <input
        type="text"
        value={form.encarregadoNome}
        onChange={(e) => setForm({ ...form, encarregadoNome: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
        placeholder="Ex: Maria Silva"
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Telefone do Encarregado
      </label>
      <input
        type="tel"
        value={form.encarregadoTelefone}
        onChange={(e) => setForm({ ...form, encarregadoTelefone: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
        placeholder="912 345 678"
      />
    </div>
  </div>
</div>

              </div>

              {/* Histórico Desportivo */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Histórico Desportivo
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ex-Clubes
                  </label>
                  <input
                    type="text"
                    value={form.exClubes}
                    onChange={(e) => setForm({ ...form, exClubes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    placeholder="Ex: Sporting CP, FC Porto"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Anos de Voleibol
                  </label>
                  <input
                    type="text"
                    value={form.anosVoleibol}
                    onChange={(e) => setForm({ ...form, anosVoleibol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    placeholder="Ex: 3 anos"
                  />
                </div>
              </div>

              {/* Avaliação do Treinador */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Avaliação do Treinador
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pontos Positivos
                  </label>
                  <textarea
                    value={form.pontosPositivos}
                    onChange={(e) => setForm({ ...form, pontosPositivos: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    rows={3}
                    placeholder="Ex: Boa técnica de manchete, altura acima da média..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Pontos Negativos
                  </label>
                  <textarea
                    value={form.pontosNegativos}
                    onChange={(e) => setForm({ ...form, pontosNegativos: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    rows={3}
                    placeholder="Ex: Pouca força no ataque, precisa melhorar defesa..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Interesse do Treinador
                  </label>
                  <select
                    value={form.interesse}
                    onChange={(e) => setForm({ ...form, interesse: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                  >
                    <option value="interessado">✅ Interessado</option>
                    <option value="neutro">⏸️ Neutro</option>
                    <option value="nao-interessado">❌ Não Interessado</option>
                  </select>
                </div>
              </div>

              {/* Aprovação da Direção */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
                  Aprovação da Direção
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estado da Aprovação
                  </label>
                  <select
                    value={form.aprovadoDirecao}
                    onChange={(e) => setForm({ ...form, aprovadoDirecao: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                  >
                    <option value="pendente">⏳ Pendente</option>
                    <option value="sim">✅ Aprovado</option>
                    <option value="nao">❌ Rejeitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Observações Gerais
                  </label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                    rows={3}
                    placeholder="Notas adicionais sobre o atleta..."
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0b1635] text-white rounded-lg font-medium hover:bg-[#152452] transition"
                >
                  {modoEdicao ? "Guardar Alterações" : "Adicionar Captação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetalhesModal && captacaoSelecionada && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetalhesModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#0b1635] to-[#152452] text-white sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">
                  {captacaoSelecionada.nome}
                </h2>
                <button
                  onClick={() => setShowDetalhesModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getBadgeInteresse(captacaoSelecionada.interesse)}`}
                >
                  {captacaoSelecionada.interesse === "interessado"
                    ? "✅ Interessado"
                    : captacaoSelecionada.interesse === "neutro"
                    ? "⏸️ Neutro"
                    : "❌ Não Interessado"}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getBadgeAprovacao(captacaoSelecionada.aprovadoDirecao)}`}
                >
                  {captacaoSelecionada.aprovadoDirecao === "sim"
                    ? "✓ Aprovado Direção"
                    : captacaoSelecionada.aprovadoDirecao === "nao"
                    ? "✗ Rejeitado Direção"
                    : "⏳ Aprovação Pendente"}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Info Básica */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Idade</p>
                    <p className="font-semibold text-slate-900">
                      {captacaoSelecionada.idade} anos
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Escalão</p>
                    <p className="font-semibold text-slate-900">
                      {captacaoSelecionada.escalao}
                    </p>
                  </div>
                  {captacaoSelecionada.telemovel && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Telemóvel</p>
                      <p className="font-semibold text-slate-900">
                        {captacaoSelecionada.telemovel}
                      </p>
                    </div>
                  )}
                  {captacaoSelecionada.email && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-slate-900">
                        {captacaoSelecionada.email}
                      </p>
                    </div>
                  )}
                  {/* Dentro do grid com Idade, Escalão, Telemóvel, Email, adiciona: */}

{captacaoSelecionada.encarregadoNome && (
  <div className="p-3 bg-slate-50 rounded-lg col-span-2">
    <p className="text-xs text-slate-500">Encarregado de Educação</p>
    <p className="font-semibold text-slate-900">{captacaoSelecionada.encarregadoNome}</p>
    {captacaoSelecionada.encarregadoTelefone && (
      <p className="text-xs text-slate-600 mt-1">📱 {captacaoSelecionada.encarregadoTelefone}</p>
    )}
  </div>
)}

                </div>
              </div>

              {/* Histórico Desportivo */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
                  Histórico Desportivo
                </h3>
                <div className="space-y-3">
                  {captacaoSelecionada.exClubes && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Ex-Clubes</p>
                      <p className="text-sm text-slate-900">
                        {captacaoSelecionada.exClubes}
                      </p>
                    </div>
                  )}
                  {captacaoSelecionada.anosVoleibol && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Anos de Voleibol</p>
                      <p className="text-sm text-slate-900">
                        {captacaoSelecionada.anosVoleibol}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Avaliação do Treinador */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
                  Avaliação do Treinador
                </h3>
                <div className="space-y-3">
                  {captacaoSelecionada.pontosPositivos && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs text-emerald-700 font-medium mb-1">
                        ✅ Pontos Positivos
                      </p>
                      <p className="text-sm text-slate-700">
                        {captacaoSelecionada.pontosPositivos}
                      </p>
                    </div>
                  )}
                  {captacaoSelecionada.pontosNegativos && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-medium mb-1">
                        ⚠️ Pontos Negativos
                      </p>
                      <p className="text-sm text-slate-700">
                        {captacaoSelecionada.pontosNegativos}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {captacaoSelecionada.observacoes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#f5c623] rounded"></div>
                    Observações Gerais
                  </h3>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">
                      {captacaoSelecionada.observacoes}
                    </p>
                  </div>
                </div>
              )}

              {/* Data de Registo */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Registado em:{" "}
                  {new Date(captacaoSelecionada.dataRegisto).toLocaleDateString(
                    "pt-PT",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDetalhesModal(false);
                    abrirModalEditar(captacaoSelecionada);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowDetalhesModal(false);
                    apagarCaptacao(captacaoSelecionada.id);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
