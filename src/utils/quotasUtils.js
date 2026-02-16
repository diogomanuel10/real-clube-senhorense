// Calcular estatísticas das quotas
export function calcularEstatisticas(quotas) {
  const total = quotas.length;
  const pagos = quotas.filter(q => q.pago).length;
  const pendentes = total - pagos;
  const totalValor = quotas.reduce((sum, q) => sum + (q.valor || 0), 0);
  const valorPago = quotas.filter(q => q.pago).reduce((sum, q) => sum + (q.valor || 0), 0);
  const valorPendente = totalValor - valorPago;
  const taxaPagamento = total > 0 ? (pagos / total * 100).toFixed(1) : 0;

  return {
    total,
    pagos,
    pendentes,
    totalValor,
    valorPago,
    valorPendente,
    taxaPagamento
  };
}

// Filtrar quotas
export function filtrarQuotas(quotas, filtros) {
  const { searchTerm, filtroEquipa, filtroEstado } = filtros;
  
  return quotas.filter(quota => {
    const matchEquipa = filtroEquipa === 'todas' || quota.equipa === filtroEquipa;
    const matchEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'pago' && quota.pago) ||
      (filtroEstado === 'pendente' && !quota.pago);
    const matchSearch = quota.atletaNome.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchEquipa && matchEstado && matchSearch;
  });
}

// Verificar se quota está vencida
export function isQuotaVencida(dataVencimento, pago) {
  if (pago) return false;
  return new Date(dataVencimento) < new Date();
}

// Formatar data
export function formatarData(data) {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-PT');
}

// Exportar para CSV
export function exportarParaCSV(quotas, mesAno) {
  const headers = ['Atleta', 'Equipa', 'Valor', 'Vencimento', 'Estado', 'Data Pagamento', 'Método'];
  
  const rows = quotas.map(quota => [
    quota.atletaNome,
    quota.equipa,
    quota.valor.toFixed(2),
    formatarData(quota.dataVencimento),
    quota.pago ? 'Paga' : 'Pendente',
    quota.pago ? formatarData(quota.dataPagamento) : '-',
    quota.metodoPagamento || '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `quotas_${mesAno}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Obter equipas únicas
export function obterEquipasUnicas(atletas) {
  return [...new Set(atletas.map(a => a.equipa))].filter(Boolean);
}
