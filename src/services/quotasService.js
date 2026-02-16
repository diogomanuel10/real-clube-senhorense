import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../utils/firebase';  // <-- Mudar de ./firebase para ../firebase

// Carregar atletas
export async function carregarAtletas() {
  try {
    const snapshot = await getDocs(collection(db, 'atletas'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao carregar atletas:', error);
    throw error;
  }
}

// Carregar quotas do mês
export async function carregarQuotas(mes, ano) {
  try {
    const q = query(
      collection(db, 'quotas'),
      where('mes', '==', parseInt(mes)),
      where('ano', '==', parseInt(ano))
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao carregar quotas:', error);
    throw error;
  }
}

// Carregar pagamentos do mês
export async function carregarPagamentos(mes, ano) {
  try {
    const q = query(
      collection(db, 'pagamentos'),
      where('mes', '==', parseInt(mes)),
      where('ano', '==', parseInt(ano))
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    throw error;
  }
}

// Criar quotas
export async function criarQuotas(atletas, formData, mes, ano) {
  try {
    // Filtrar atletas pelas equipas selecionadas
    let atletasFiltrados = atletas;
    if (formData.equipas.length > 0) {
      atletasFiltrados = atletas.filter(a => formData.equipas.includes(a.equipa));
    }

    // Criar quota para cada atleta
    const promises = atletasFiltrados.map(atleta => {
      return addDoc(collection(db, 'quotas'), {
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
      });
    });

    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Erro ao criar quotas:', error);
    throw error;
  }
}

// Registar pagamento
export async function registarPagamento(quotaId, atletaId, atletaNome, equipa, dadosPagamento, mes, ano) {
  try {
    // Registar pagamento
    await addDoc(collection(db, 'pagamentos'), {
      atletaId,
      atletaNome,
      equipa,
      valor: parseFloat(dadosPagamento.valor),
      dataPagamento: dadosPagamento.dataPagamento,
      metodoPagamento: dadosPagamento.metodoPagamento,
      observacoes: dadosPagamento.observacoes,
      mes: parseInt(mes),
      ano: parseInt(ano),
      createdAt: new Date()
    });

    // Atualizar quota para pago
    await updateDoc(doc(db, 'quotas', quotaId), {
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
export async function marcarComoPago(quotaId) {
  try {
    await updateDoc(doc(db, 'quotas', quotaId), {
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
export async function removerPagamento(quotaId, atletaId, pagamentos) {
  try {
    // Atualizar quota para não pago
    await updateDoc(doc(db, 'quotas', quotaId), {
      pago: false,
      dataPagamento: null,
      metodoPagamento: null,
      updatedAt: new Date()
    });
    
    // Remover do histórico de pagamentos
    const pagamento = pagamentos.find(p => p.atletaId === atletaId);
    if (pagamento) {
      await deleteDoc(doc(db, 'pagamentos', pagamento.id));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao remover pagamento:', error);
    throw error;
  }
}

// Eliminar quota
export async function eliminarQuota(quotaId) {
  try {
    await deleteDoc(doc(db, 'quotas', quotaId));
    return true;
  } catch (error) {
    console.error('Erro ao eliminar quota:', error);
    throw error;
  }
}
