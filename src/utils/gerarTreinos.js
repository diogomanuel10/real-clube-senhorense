import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function gerarTreinosParaPlano(plano, dataInicio, dataFim) {
  const treinosRef = collection(db, 'treinos');
  const diaMs = 24 * 60 * 60 * 1000;
  let current = new Date(dataInicio.getTime());

  const promises = [];

  while (current <= dataFim) {
    const diaSemana = current.getDay(); // 0 dom, 1 seg, ...

    if (plano.diasSemana.includes(diaSemana)) {
      const dataISO = current.toISOString().slice(0, 10);

      const treinoDoc = {
        equipa: plano.equipa,
        data: dataISO,
        horaInicio: plano.horaInicio,
        horaFim: plano.horaFim,
        local: plano.local,
        estado: 'planeado',
        planoId: plano.id || null,
        criadoEm: new Date()
      };

      promises.push(addDoc(treinosRef, treinoDoc));
    }

    current = new Date(current.getTime() + diaMs);
  }

  await Promise.all(promises);
}
