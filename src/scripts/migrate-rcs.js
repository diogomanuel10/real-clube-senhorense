import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4BCWSadjNCWBuofwcOSXXbDGiI2qrGAE",
  authDomain: "real-clube-senhorense.firebaseapp.com",
  projectId: "real-clube-senhorense",
  storageBucket: "real-clube-senhorense.firebasestorage.app",
  messagingSenderId: "687082892402",
  appId: "1:687082892402:web:452798a2aa8c71b0cea6eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clubId = 'senhorense';

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

async function migrateCollection(colName) {
  console.log(`\n🟡 Migrando "${colName}"...`);
  
  const sourceSnap = await getDocs(collection(db, colName));
  console.log(`  Encontrados ${sourceSnap.size} docs`);
  
  if (sourceSnap.empty) {
    console.log(`  👻 "${colName}" vazia, pulando`);
    return;
  }

  let index = 0;
  while (index < sourceSnap.docs.length) {
    const batch = writeBatch(db);
    const slice = sourceSnap.docs.slice(index, index + 400);

    slice.forEach((docSnap) => {
      const data = docSnap.data();
      const newRef = doc(collection(db, `clubs/${clubId}/${colName}`), docSnap.id);
      batch.set(newRef, {
        ...data,
        clubId,
        migratedFrom: colName,
      });
    });

    await batch.commit();
    index += slice.length;
  }
  
  console.log(`  ✅ "${colName}" migrada (${sourceSnap.size} docs)`);
}

async function migrateAll() {
  console.log('🚀 INICIANDO MIGRAÇÃO SENHORENSE');
  console.log('⚠️  ISTO SÓ COPIA, NÃO APAGA NADA');
  
  for (const colName of collectionsToMigrate) {
    await migrateCollection(colName);
  }
  
  console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
  console.log('Verifica no Firestore: clubs/senhorense/...');
}

migrateAll().catch(console.error);
