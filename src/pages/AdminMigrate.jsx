import React, { useState } from 'react';
import { db } from '../firebase'; // ajusta se necessário
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { useClub } from '../hooks/useClub';

const collectionsToMigrate = [
  'utilizadores',
  'treinos',
  'treinadores',
  'presencas',
  'planosTreino',
  'jogos',
  'exercicios',
  'estatisticas_jogos',
  'escaloes',
  'episodiosClinicos',
  'captacoes',
  'avaliacoes_treino',
  'atletas',
  'acoes_jogo',
];

const AdminMigrate = () => {
  const { clubId } = useClub();
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  const appendLog = (msg) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const migrateCollection = async (colName) => {
    setRunning(true);
    appendLog(`Iniciar migração de "${colName}" para clubs/${clubId}/${colName}...`);

    try {
      const sourceSnap = await getDocs(collection(db, colName));
      appendLog(`Encontrados ${sourceSnap.size} documentos em "${colName}".`);

      if (sourceSnap.empty) {
        appendLog(`Coleção "${colName}" está vazia, nada a migrar.`);
        setRunning(false);
        return;
      }

      const docs = sourceSnap.docs;
      let index = 0;

      while (index < docs.length) {
        const batch = writeBatch(db);
        const slice = docs.slice(index, index + 400);

        slice.forEach((docSnap) => {
          const data = docSnap.data();
          const newRef = doc(
            collection(db, `clubs/${clubId}/${colName}`)
          );
          batch.set(newRef, {
            ...data,
            clubId,
            migratedFrom: colName,
          });
        });

        await batch.commit();
        appendLog(
          `Migrei ${slice.length} docs de "${colName}" (total: ${
            index + slice.length
          }).`
        );

        index += slice.length;
      }

      appendLog(`✅ Migração da coleção "${colName}" concluída.`);
    } catch (err) {
      console.error(err);
      appendLog(`❌ Erro ao migrar "${colName}": ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Admin · Migração RCS para multi-clube</h1>
      <p>Clube atual detectado: <strong>{clubId}</strong></p>
      <p>
        Isto <strong>copia</strong> os dados das coleções raiz para
        <code> clubs/{clubId}/... </code> sem apagar nada.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {collectionsToMigrate.map((col) => (
          <button
            key={col}
            disabled={running}
            onClick={() => migrateCollection(col)}
            style={{
              padding: '8px 12px',
              cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            Migrar {col}
          </button>
        ))}
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 8,
          maxHeight: 300,
          overflow: 'auto',
          fontSize: 12,
          background: '#f9f9f9',
        }}
      >
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

export default AdminMigrate;
