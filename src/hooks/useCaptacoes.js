import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { usePermissions } from "./usePermissions";

export const useCaptacoes = (user) => {
  const permissions = usePermissions(user);

  // States
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
    posicao: "",
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
    if (!permissions.loading && permissions.isTreinador !== undefined) {
      carregarCaptacoes();
      carregarEscaloes();
    }
  }, [permissions.loading, permissions.isTreinador, permissions.equipas]); // 👈 

  const carregarCaptacoes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "captacoes"));
      let lista = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));


      // ✅ CORRIGIDO - protege undefined
      if (permissions.isTreinador && permissions.equipas.length > 0) {
        lista = lista.filter((cap) => {
          const escalao = cap.escalao || "";
          return permissions.equipas.includes(escalao);
        });
      }

      lista.sort((a, b) =>
        new Date(b.dataRegisto).getTime() - new Date(a.dataRegisto).getTime()
      );
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
      let lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (permissions.isTreinador && permissions.equipas.length > 0) {
        lista = lista.filter((esc) =>
          permissions.equipas.includes(esc.nome),
        );
      }

      setEscaloes(lista);
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const criarAtletaAprovado = useCallback(async (captacao) => {
    try {
      // 1. Criar atleta na coleção "atletas"
      const novoAtleta = {
        nome: captacao.nome,
        idade: parseInt(captacao.idade),
        escalao: captacao.escalao,
        telemovel: captacao.telemovel,
        email: captacao.email,
        encarregadoNome: captacao.encarregadoNome,
        encarregadoTelefone: captacao.encarregadoTelefone,
        dataIncricao: new Date().toISOString(),
        dataNascimento: null, // direção preenche depois
        ativo: true,
        origemCaptacao: captacao.id
      };

      await addDoc(collection(db, "atletas"), novoAtleta);

      // 2. Adicionar atleta ao escalão
      const escalaoRef = doc(db, "escaloes", captacao.escalao);
      await updateDoc(escalaoRef, {
        atletas: arrayUnion(novoAtleta.nome)
      });

      // 3. Marcar captação como aprovada e arquivada
      await updateDoc(doc(db, "captacoes", captacao.id), {
        aprovadoDirecao: "sim",
        dataAprovacao: new Date().toISOString(),
        estado: "aprovado"
      });

      carregarCaptacoes();
      alert("✅ Atleta criado com sucesso no escalão!");
    } catch (err) {
      console.error("Erro ao criar atleta:", err);
      alert("❌ Erro ao criar atleta: " + err.message);
    }
  }, [carregarCaptacoes]);

  // Handlers dos modais
  const abrirModalAdicionar = useCallback(() => {
    const escalaoInicial =
      permissions.isTreinador && permissions.equipas.length === 1
        ? permissions.equipas[0]
        : "";

    setForm({
      nome: "",
      idade: "",
      escalao: escalaoInicial,
      posicao: "",
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
    setModoEdicao(false);
    setCaptacaoSelecionada(null);
    setShowModal(true);
  }, [permissions]);

const abrirModalEditar = useCallback((captacao) => {

  
  // 1. Fecha TODOS os modais PRIMEIRO
  setShowDetalhesModal(false);
  setShowModal(false);
  
  // 2. Timeout para garantir que fechou
  setTimeout(() => {

    
    // 3. CARREGA OS DADOS
    setForm({
      nome: captacao.nome || "",
      idade: captacao.idade || "",
      escalao: captacao.escalao || "",
      posicao: captacao.posicao || "",
      telemovel: captacao.telemovel || "",
      email: captacao.email || "",
      encarregadoNome: captacao.encarregadoNome || "",
      encarregadoTelefone: captacao.encarregadoTelefone || "",
      exClubes: captacao.exClubes || "",
      anosVoleibol: captacao.anosVoleibol || "",
      pontosPositivos: captacao.pontosPositivos || "",
      pontosNegativos: captacao.pontosNegativos || "",
      interesse: captacao.interesse || "neutro",
      observacoes: captacao.observacoes || "",
    });
    
    setModoEdicao(true);
    setCaptacaoSelecionada(captacao);
    setShowModal(true);
  }, 200);
}, [permissions]);





  const abrirDetalhes = useCallback((captacao) => {
    setCaptacaoSelecionada(captacao);
    setShowDetalhesModal(true);
  }, []);

  const guardarCaptacao = useCallback(async (e) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.idade || !form.escalao) {
      alert("Nome, idade e escalão são obrigatórios");
      return;
    }

    if (permissions.isTreinador && !permissions.equipas.includes(form.escalao)) {
      alert("Não tem permissão para criar/editar captações neste escalão");
      return;
    }

    const primeiroNome = user?.displayName?.split(' ')[0] || user?.nome || 'Admin';

    try {
      if (modoEdicao && captacaoSelecionada) {
        // Treinador só edita seus campos
        const dadosTreinador = {
          nome: form.nome,
          idade: form.idade,
          escalao: form.escalao,
          posicao: form.posicao,
          telemovel: form.telemovel,
          email: form.email,
          encarregadoNome: form.encarregadoNome,
          encarregadoTelefone: form.encarregadoTelefone,
          exClubes: form.exClubes,
          anosVoleibol: form.anosVoleibol,
          pontosPositivos: form.pontosPositivos,
          pontosNegativos: form.pontosNegativos,
          interesse: form.interesse,
          observacoes: form.observacoes,
          tratadoTreinador: false,
          dataTratadoTreinador: null
        };

        await updateDoc(doc(db, "captacoes", captacaoSelecionada.id), dadosTreinador);
      } else {

        const novaCaptacao = {
          ...form,
          criadoPor: permissions.isTreinador ? "treinador" : "direcao",
          criadoPorUid: user.uid,           // ID do utilizador atual
          criadoPorNome: primeiroNome,
          dataRegisto: new Date().toISOString(),
          aprovadoDirecao: "pendente",
          estado: "pendente",
          tratadoTreinador: false,
          dataTratadoTreinador: null
        };
        await addDoc(collection(db, "captacoes"), novaCaptacao);
      }

      setShowModal(false);
      carregarCaptacoes();
    } catch (err) {
      console.error("Erro ao guardar captação:", err);
      alert("Erro ao guardar: " + err.message);
    }
  }, [form, modoEdicao, captacaoSelecionada, permissions, user, carregarCaptacoes]); // 👈 adiciona 'user'

  // Apagar captação
  const apagarCaptacao = useCallback(async (id) => {
    const captacao = captacoes.find((c) => c.id === id);

    if (
      captacao &&
      permissions.isTreinador &&
      !permissions.equipas.includes(captacao.escalao)
    ) {
      alert("Não tem permissão para apagar esta captação");
      return;
    }

    if (!confirm("Tens a certeza que queres eliminar esta captação?")) return;

    try {
      await deleteDoc(doc(db, "captacoes", id));
      carregarCaptacoes();
    } catch (err) {
      console.error("Erro ao apagar captação:", err);
      alert("Erro ao apagar: " + err.message);
    }
  }, [captacoes, permissions, carregarCaptacoes]);

  // Badges
  const getBadgeInteresse = useCallback((interesse) => {
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
  }, []);

  const getBadgeAprovacao = useCallback((aprovacao) => {
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
  }, []);

  // Filtros
  const onResetFilters = useCallback(() => {
    setFiltroStatus("todos");
    setFiltroAprovacao("todos");
    setFiltroEscalao("todos");
  }, []);

  const captacoesFiltradas = captacoes.filter((cap) => {
    if (filtroStatus !== "todos" && cap.interesse !== filtroStatus) return false;
    if (filtroAprovacao !== "todos" && cap.aprovadoDirecao !== filtroAprovacao)
      return false;
    if (filtroEscalao !== "todos" && cap.escalao !== filtroEscalao) return false;
    return true;
  });

  return {
    permissions,
    captacoes: captacoesFiltradas,
    escaloes,
    loading,
    showModal,
    setShowModal,
    showDetalhesModal,
    setShowDetalhesModal,
    modoEdicao,
    captacaoSelecionada,
    form,
    setForm,
    filtroStatus,
    setFiltroStatus,
    filtroAprovacao,
    setFiltroAprovacao,
    filtroEscalao,
    setFiltroEscalao,
    abrirModalAdicionar,
    abrirModalEditar,
    abrirDetalhes,
    guardarCaptacao,
    apagarCaptacao,
    getBadgeInteresse,
    getBadgeAprovacao,
    onResetFilters,
  };
};
