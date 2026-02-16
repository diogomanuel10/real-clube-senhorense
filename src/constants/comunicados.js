export const CATEGORIAS = [
  { value: 'importante', label: '🔴 Importante', color: 'red' },
  { value: 'geral', label: '📢 Geral', color: 'blue' },
  { value: 'evento', label: '🎉 Evento', color: 'purple' },
  { value: 'treino', label: '🏐 Treino', color: 'green' },
  { value: 'competicao', label: '🏆 Competição', color: 'yellow' },
];

export const getCategoriaConfig = (categoria) => {
  const config = CATEGORIAS.find(c => c.value === categoria);
  return config || CATEGORIAS[1]; // default: geral
};

export const getCategoriaColors = (categoria) => {
  const colors = {
    importante: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700 border-red-200',
    },
    geral: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    evento: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
    },
    treino: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700 border-green-200',
    },
    competicao: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
  };
  return colors[categoria] || colors.geral;
};
