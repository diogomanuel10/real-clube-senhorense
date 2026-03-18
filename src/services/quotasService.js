import { 
  collection, addDoc, updateDoc, deleteDoc, 
  getDocs, doc, query, where 
} from 'firebase/firestore';
import { db } from '../utils/firebase';

// Carregar atletas
export async function carregarAtletas(clubId) {
  try {
    const snapshot = await getDocs(collection(db, 'clubs', clubId, 'atletas'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Erro ao carregar atletas:', error);
    throw error;
  }
}

// Carregar quotas do mês
export async function carregarQuotas(mes, ano, clubId) {
  try {
    const q = query(
      collection(db, 'clubs', clubId, 'quotas'),
      where('mes', '==', parseInt(mes)),
      where('ano', '==', parseInt(ano))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Erro ao carregar quotas:', error);
    throw error;
  }
}

// Carregar pagamentos do mês
export async function carregarPagamentos(mes, ano, clubId) {
  try {
    const q = query(
      collection(db, 'clubs', clubId, 'pagamentos'),
      where('mes', '==', parseInt(mes)),
      where('ano', '==', parseInt(ano))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    throw error;
  }
}

// Criar quotas
export async function criarQuotas(atletas, formData, mes, ano, clubId) {
  try {
    let atletasFiltrados = atletas;
    if (formData.equipas.length > 0) {
      atletasFiltrados = atletas.filter(a => formData.equipas.includes(a.equipa));
    }
    const promises = atletasFiltrados.map(atleta =>
      addDoc(collection(db, 'clubs', clubId, 'quotas'), {
        atletaId: atleta.id,
        atletaNome: atleta.nome,
        equipa: atleta.equipa,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao,
        dataVencimento: formData.dataVencimento,
        mes: parseInt(mes),
        ano: parseInt(ano),
        pago: false,
        createdAt: new Date()
      })
    );
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Erro ao criar quotas:', error);
    throw error;
  }
}

// Registar pagamento
export async function registarPagamento(quotaId, atletaId, atletaNome, equipa, dadosPagamento, mes, ano, clubId) {
  try {
    await addDoc(collection(db, 'clubs', clubId, 'pagamentos'), {
      atletaId, atletaNome, equipa,
      valor: parseFloat(dadosPagamento.valor),
      dataPagamento: dadosPagamento.dataPagamento,
      metodoPagamento: dadosPagamento.metodoPagamento,
      observacoes: dadosPagamento.observacoes,
      mes: parseInt(mes),
      ano: parseInt(ano),
      createdAt: new Date()
    });
    await updateDoc(doc(db, 'clubs', clubId, 'quotas', quotaId), {
      pago: true,
      dataPagamento: dadosPagamento.dataPagamento,
      metodoPagamento: dadosPagamento.metodoPagamento,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    throw error;
  }
}

// Marcar quota como paga (sem detalhes)
export async function marcarComoPago(quotaId, clubId) {
  try {
    await updateDoc(doc(db, 'clubs', clubId, 'quotas', quotaId), {
      pago: true,
      dataPagamento: new Date().toISOString().split('T')[0],
      metodoPagamento: 'Não especificado',
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao marcar como pago:', error);
    throw error;
  }
}

// Remover pagamento
export async function removerPagamento(quotaId, atletaId, pagamentos, clubId) {
  try {
    await updateDoc(doc(db, 'clubs', clubId, 'quotas', quotaId), {
      pago: false,
      dataPagamento: null,
      metodoPagamento: null,
      updatedAt: new Date()
    });
    const pagamento = pagamentos.find(p => p.atletaId === atletaId);
    if (pagamento) {
      await deleteDoc(doc(db, 'clubs', clubId, 'pagamentos', pagamento.id));
    }
    return true;
  } catch (error) {
    console.error('Erro ao remover pagamento:', error);
    throw error;
  }
}

// Eliminar quota
export async function eliminarQuota(quotaId, clubId) {
  try {
    await deleteDoc(doc(db, 'clubs', clubId, 'quotas', quotaId));
    return true;
  } catch (error) {
    console.error('Erro ao eliminar quota:', error);
    throw error;
  }
}
