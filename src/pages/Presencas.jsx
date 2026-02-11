import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Award,
  AlertCircle
} from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function Presencas() {
  const [escaloes, setEscaloes] = useState([]);
  const [escalaoSelecionado, setEscalaoSelecionado] = useState("");
  const [atletas, setAtletas] = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    carregarEscaloes();
  }, []);

  useEffect(() => {
    if (escalaoSelecionado) {
      carregarDadosEscalao();
    }
  }, [escalaoSelecionado, currentYear, currentMonth]);

  const carregarEscaloes = async () => {
    try {
      const snap = await getDocs(collection(db, "escaloes"));
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
      setEscaloes(lista);
      
      if (lista.length > 0) {
        setEscalaoSelecionado(lista[0].nome);
      }
    } catch (err) {
      console.error("Erro ao carregar escalões:", err);
    }
  };

  const carregarDadosEscalao = async () => {
    if (!escalaoSelecionado) return;
    
    setLoading(true);
    try {
      // Carregar atletas do escalão
      const atletasSnap = await getDocs(collection(db, "atletas"));
      const todosAtletas = atletasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const atletasEscalao = todosAtletas.filter((a) => a.equipa === escalaoSelecionado);
      setAtletas(atletasEscalao);

      // Carregar treinos do mês do escalão
      const primeiroDia = new Date(currentYear, currentMonth, 1);
      const ultimoDia = new Date(currentYear, currentMonth + 1, 0);
      
      const dataInicio = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
      const dataFim = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${ultimoDia.getDate()}`;

      const treinosSnap = await getDocs(collection(db, "treinos"));
      const todosTreinos = treinosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const treinosEscalao = todosTreinos.filter(
        (t) => t.equipa === escalaoSelecionado && t.data >= dataInicio && t.data <= dataFim
      );
      setTreinos(treinosEscalao);

      // Carregar presenças
      if (treinosEscalao.length > 0) {
        const treinoIds = treinosEscalao.map((t) => t.id);
        const presencasSnap = await getDocs(collection(db, "presencas"));
        const todasPresencas = presencasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const presencasEscalao = todasPresencas.filter((p) => treinoIds.includes(p.treinoId));
        setPresencas(presencasEscalao);
      } else {
        setPresencas([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const mudarMes = (delta) => {
    let novoMes = currentMonth + delta;
    let novoAno = currentYear;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    setCurrentMonth(novoMes);
    setCurrentYear(novoAno);
  };

  // Calcular estatísticas por atleta
  const calcularEstatisticas = (atletaId) => {
    const treinosDoAtleta = treinos.length;
    const presencasDoAtleta = presencas.filter((p) => p.atletaId === atletaId);
    
    const presentes = presencasDoAtleta.filter((p) => p.estado === "presente").length;
    const faltas = presencasDoAtleta.filter((p) => p.estado === "falta").length;
    const justificadas = presencasDoAtleta.filter((p) => p.estado === "justificada").length;
    
    const percentagem = treinosDoAtleta > 0 
      ? Math.round((presentes / treinosDoAtleta) * 100) 
      : 0;

    return { presentes, faltas, justificadas, percentagem, total: treinosDoAtleta };
  };

  // Calcular estatísticas gerais do escalão
  const calcularEstatisticasGerais = () => {
    if (atletas.length === 0 || treinos.length === 0) {
      return { mediaPresenca: 0, melhorAtleta: null, piorAtleta: null };
    }

    const estatisticas = atletas.map((atleta) => ({
      ...atleta,
      stats: calcularEstatisticas(atleta.id),
    }));

    const mediaPresenca = Math.round(
      estatisticas.reduce((acc, a) => acc + a.stats.percentagem, 0) / estatisticas.length
    );

    const melhorAtleta = estatisticas.reduce((best, current) => 
      current.stats.percentagem > (best?.stats.percentagem || 0) ? current : best
    , null);

    const piorAtleta = estatisticas.reduce((worst, current) => 
      current.stats.percentagem < (worst?.stats.percentagem || 100) ? current : worst
    , null);

    return { mediaPresenca, melhorAtleta, piorAtleta };
  };

  const estatisticasGerais = calcularEstatisticasGerais();

  // Obter cor da percentagem
  const getCorPercentagem = (percentagem) => {
    if (percentagem >= 80) return "text-emerald-700 bg-emerald-100";
    if (percentagem >= 60) return "text-amber-700 bg-amber-100";
    return "text-red-700 bg-red-100";
  };

  // Organizar atletas por percentagem
  const atletasOrdenados = atletas
    .map((atleta) => ({
      ...atleta,
      stats: calcularEstatisticas(atleta.id),
    }))
    .sort((a, b) => b.stats.percentagem - a.stats.percentagem);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-[#0b1635]" />
          <h1 className="text-2xl font-bold text-slate-900">Presenças</h1>
        </div>
        <p className="text-sm text-slate-600">
          Análise de assiduidade e estatísticas por escalão
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Seletor de Escalão */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Escalão
            </label>
            <select
              value={escalaoSelecionado}
              onChange={(e) => setEscalaoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623]"
            >
              {escaloes.map((esc) => (
                <option key={esc.id} value={esc.nome}>
                  {esc.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Navegação de Mês */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Período
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => mudarMes(-1)}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center font-semibold text-slate-900">
                {MESES[currentMonth]} {currentYear}
              </div>
              <button
                onClick={() => mudarMes(1)}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-[#0b1635] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Cards de Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Média de Presença */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-900">
                  {estatisticasGerais.mediaPresenca}%
                </span>
              </div>
              <p className="text-sm font-medium text-blue-800">Média de Assiduidade</p>
              <p className="text-xs text-blue-600 mt-1">
                {treinos.length} treinos este mês
              </p>
            </div>

            {/* Melhor Atleta */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">MELHOR ASSIDUIDADE</span>
              </div>
              {estatisticasGerais.melhorAtleta ? (
                <>
                  <p className="font-bold text-slate-900 truncate">
                    {estatisticasGerais.melhorAtleta.nome}
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {estatisticasGerais.melhorAtleta.stats.percentagem}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Sem dados</p>
              )}
            </div>

            {/* Atenção */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">PRECISA ATENÇÃO</span>
              </div>
              {estatisticasGerais.piorAtleta ? (
                <>
                  <p className="font-bold text-slate-900 truncate">
                    {estatisticasGerais.piorAtleta.nome}
                  </p>
                  <p className="text-2xl font-bold text-amber-700">
                    {estatisticasGerais.piorAtleta.stats.percentagem}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Sem dados</p>
              )}
            </div>
          </div>

          {/* Tabela de Atletas */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Atletas ({atletas.length})
              </h3>
            </div>

            {atletas.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum atleta neste escalão</p>
              </div>
            ) : treinos.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum treino marcado este mês</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                                    <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Atleta
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Assiduidade
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Presenças
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Faltas
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Justificadas
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Total Treinos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {atletasOrdenados.map((atleta, index) => (
                      <tr key={atleta.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0b1635] flex items-center justify-center text-white font-semibold text-sm">
                              {atleta.nome?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {atleta.nome}
                              </p>
                              <p className="text-xs text-slate-500">
                                {atleta.posicao || "Sem posição"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCorPercentagem(atleta.stats.percentagem)}`}>
                              {atleta.stats.percentagem}%
                            </span>
                            {index === 0 && atleta.stats.percentagem >= 80 && (
                              <Award className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                            {atleta.stats.presentes}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                            {atleta.stats.faltas}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-semibold text-sm">
                            {atleta.stats.justificadas}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-medium text-slate-700">
                            {atleta.stats.total}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

