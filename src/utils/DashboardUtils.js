export const getTreinosHoje = (treinos) => {
  const hoje = new Date().toISOString().split('T')[0];
  return treinos.filter(treino => treino.data === hoje);
};

export const getHoraSaudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 19) return "Boa tarde";
  return "Boa noite";
};

export const formatarHoraTreino = (horaInicio, horaFim) => {
  return `${horaInicio} - ${horaFim}`;
};

export const calcularTempo = (data) => {
  const agora = new Date();
  const dataObj = new Date(data);
  const diff = Math.floor((agora - dataObj) / 1000); // segundos

  if (diff < 60) return "Agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return dataObj.toLocaleDateString('pt-PT');
};

export const getNivelPrioridade = (prioridade) => {
  const niveis = {
    alta: { color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    media: { color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    baixa: { color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  };
  return niveis[prioridade] || niveis.baixa;
};
