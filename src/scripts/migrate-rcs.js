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

const clubId = 'KN05RGyYgnu7HuJwEFnV';  // ← O TEU DESTINO

const collectionsToMigrate = [
  'utilizadores', 'treinos', 'treinadores', 'presencas', 'planosTreino',
  'jogos', 'exercicios', 'estatisticas_jogos', 'escaloes', 
  'episodiosClinicos', 'captacoes', 'avaliacoes_treino', 'atletas', 'acoes_jogo'
];

async function migrateCollection(colName) {
  console.log(`🟡 "${colName}"...`);
  const sourceSnap = await getDocs(collection(db, colName));
  if (sourceSnap.empty) return;
  
  let index = 0;
  while (index < sourceSnap.docs.length) {
    const batch = writeBatch(db);
    const slice = sourceSnap.docs.slice(index, index + 400);
    
    slice.forEach(docSnap => {
      const data = docSnap.data();
      const newRef = doc(collection(db, `clubs/${clubId}/${colName}`), docSnap.id);
      batch.set(newRef, { ...data, clubId });
    });
    
    await batch.commit();
    index += 400;
  }
  console.log(`✅ "${colName}"`);
}

async function migrateAll() {
  console.log(`🚀 KN05RGyYgnu7HuJwEFnV`);
  for (const colName of collectionsToMigrate) {
    await migrateCollection(colName);
  }
  console.log('🎉 TERMINADO!');
}

migrateAll();
