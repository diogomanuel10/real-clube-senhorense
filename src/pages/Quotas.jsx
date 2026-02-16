import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import QuotasStats from '../components/quotas/QuotasStats';
import QuotasFiltros from '../components/quotas/QuotasFiltros';
import QuotasTabela from '../components/quotas/QuotasTabela';
import ModalNovaQuota from '../components/quotas/ModalNovaQuota';
import ModalRegistarPagamento from '../components/quotas/ModalRegistarPagamento';
import { 
  carregarAtletas, 
  carregarQuotas, 
  carregarPagamentos,
  criarQuotas,
  registarPagamento,
  marcarComoPago,
  removerPagamento,
  eliminarQuota
} from '../services/quotasService';
import { doc, deleteDoc } from 'firebase/firestore';
import { 
  calcularEstatisticas, 
  filtrarQuotas, 
  exportarParaCSV,
  obterEquipasUnicas
} from '../utils/QuotasUtils';

export default function Quotas() {
  const [atletas, setAtletas] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [selectedQuota, setSelectedQuota] = useState(null);
  
  // Filtros
  const [filtroEquipa, setFiltroEquipa] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mês/Ano
  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    carregarDados();
  }, [mesAno]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [ano, mes] = mesAno.split('-');
      
      const [atletasData, quotasData, pagamentosData] = await Promise.all([
        carregarAtletas(),
        carregarQuotas(mes, ano),
        carregarPagamentos(mes, ano)
      ]);
      
      setAtletas(atletasData);
      setQuotas(quotasData);
      setPagamentos(pagamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Verifica a consola.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuota = async (formData) => {
    try {
      const [ano, mes] = mesAno.split('-');
      await criarQuotas(atletas, formData, mes, ano);
      setShowAddModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar quota:', error);
      alert('Erro ao criar quotas. Tenta novamente.');
    }
  };

  const handleRegistarPagamento = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const dadosPagamento = {
      valor: form.valor.value,
      dataPagamento: form.dataPagamento.value,
      metodoPagamento: form.metodoPagamento.value,
      observacoes: form.observacoes.value
    };

    try {
      const [ano, mes] = mesAno.split('-');
      await registarPagamento(
        selectedQuota.id,
        selectedAtleta.id,
        selectedAtleta.nome,
        selectedAtleta.equipa,
        dadosPagamento,
        mes,
        ano
      );
      
      setShowPagamentoModal(false);
      setSelectedAtleta(null);
      setSelectedQuota(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao registar pagamento:', error);
      alert('Erro ao registar pagamento. Tenta novamente.');
    }
  };

  const handleMarcarComoPago = async (quota) => {
    try {
      await marcarComoPago(quota.id);
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      alert('Erro ao marcar como pago. Tenta novamente.');
    }
  };

  const handleRemoverPagamento = async (quota) => {
    if (!confirm('Tens a certeza que queres remover este pagamento?')) return;
    
    try {
      await removerPagamento(quota.id, quota.atletaId, pagamentos);
      carregarDados();
    } catch (error) {
      console.error('Erro ao remover pagamento:', error);
      alert('Erro ao remover pagamento. Tenta novamente.');
    }
  };

  const handleAbrirModalPagamento = (quota) => {
    const atleta = atletas.find(a => a.id === quota.atletaId);
    setSelectedAtleta(atleta);
    setSelectedQuota(quota);
    setShowPagamentoModal(true);
  };

  const handleEliminarQuota = async (quota) => {
  if (!confirm(`Tens a certeza que queres eliminar a quota de ${quota.atletaNome}?`)) return;
  
  try {
    await eliminarQuota(quota.id);
    
    // Se a quota estava paga, também remover do histórico de pagamentos
    if (quota.pago) {
      const pagamento = pagamentos.find(p => p.atletaId === quota.atletaId);
      if (pagamento) {
        await deleteDoc(doc(db, 'pagamentos', pagamento.id));
      }
    }
    
    carregarDados();
  } catch (error) {
    console.error('Erro ao eliminar quota:', error);
    alert('Erro ao eliminar quota. Tenta novamente.');
  }
};


  const handleExportar = () => {
    exportarParaCSV(quotasFiltradas, mesAno);
  };

  // Calcular estatísticas
  const stats = calcularEstatisticas(quotas);

  // Filtrar quotas
  const quotasFiltradas = filtrarQuotas(quotas, {
    searchTerm,
    filtroEquipa,
    filtroEstado
  });

  // Obter equipas
  const equipas = obterEquipasUnicas(atletas);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">A carregar quotas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-700 mb-2">Quotas e Pagamentos</h1>
            <p className="text-slate-700">Gestão de quotas mensais dos atletas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="month"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleExportar}
              disabled={quotasFiltradas.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaDownload /> Exportar
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Nova Quota
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <QuotasStats stats={stats} />

        {/* Filtros */}
        <QuotasFiltros
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtroEquipa={filtroEquipa}
          setFiltroEquipa={setFiltroEquipa}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
          equipas={equipas}
        />

        {/* Tabela */}
        <QuotasTabela
          quotas={quotasFiltradas}
          onRegistarPagamento={handleAbrirModalPagamento}
          onMarcarComoPago={handleMarcarComoPago}
          onRemoverPagamento={handleRemoverPagamento}
          onEliminarQuota={handleEliminarQuota} 
        />

        {/* Modais */}
        <ModalNovaQuota
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddQuota}
          equipas={equipas}
        />

        <ModalRegistarPagamento
          isOpen={showPagamentoModal}
          onClose={() => {
            setShowPagamentoModal(false);
            setSelectedAtleta(null);
            setSelectedQuota(null);
          }}
          onSubmit={handleRegistarPagamento}
          atleta={selectedAtleta}
          quota={selectedQuota}
        />
      </div>
    </div>
  );
}
