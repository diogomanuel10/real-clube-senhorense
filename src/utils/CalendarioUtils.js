export const getDiasDoMes = (ano, mes) => {
  const primeiro = new Date(ano, mes, 1);
  const ultimo = new Date(ano, mes + 1, 0);
  const diasNoMes = ultimo.getDate();
  const offset = (primeiro.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let dia = 1; dia <= diasNoMes; dia++) {
    cells.push(new Date(ano, mes, dia));
  }
  return cells;
};

export const agruparTreinosPorDia = (treinos, ano, mes) => {
  return treinos.reduce((acc, treino) => {
    if (!treino.data) return acc;
    const [y, m, d] = treino.data.split("-").map(Number);
    if (y === ano && m === mes + 1) {
      if (!acc[d]) acc[d] = [];
      acc[d].push(treino);
    }
    return acc;
  }, {});
};

export const isHoje = (date) => {
  return date.toDateString() === new Date().toDateString();
};
