// limpa.js - APENAS TREINOS (ES modules)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

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

async function limparTreinos() {
  // Formato YYYY-MM-DD
  const q = query(
    collection(db, 'treinos'),
    where('data', '>=', '2025-09-01'),
    where('data', '<=', '2026-02-18')
  );

  console.log('🔍 Filtrando treinos 01/09/2025 - 18/02/2026...');
  const snapshot = await getDocs(q);
  console.log(`📊 ${snapshot.size} treinos encontrados`);

  if (snapshot.empty) {
    console.log('✅ NENHUM treino no período');
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc, i) => {
    console.log(`🗑️ ${i+1}/${snapshot.size}: ${doc.id}`);
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`\n🎉 ✅ APAGADOS ${snapshot.size} treinos!`);
  console.log('🔄 Refresh app → assiduidade corrigida!');
}

limparTreinos().catch(err => {
  console.error('❌ ERRO:', err);
  process.exit(1);
});