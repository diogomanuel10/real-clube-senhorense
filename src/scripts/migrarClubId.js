// scripts/migrarClubId.js (corre em Node.js com firebase-admin)
const CLUBE_ID = "real-clube-senhorense";
const colecoes = [
  "utilizadores", "treinos", "treinadores", "presencas",
  "planosTreino", "jogos", "exercicios", "estatisticas_jogos",
  "escaloes", "episodiosClinicos", "captacoes",
  "avaliacoes_treino", "atletas", "acoes_jogo"
];

for (const colecao of colecoes) {
  const snap = await db.collection(colecao).get();
  const batch = db.batch();
  snap.docs.forEach(doc => {
    batch.update(doc.ref, { clubId: CLUBE_ID });
  });
  await batch.commit();
  console.log(`✅ ${colecao}: ${snap.size} documentos migrados`);
}
