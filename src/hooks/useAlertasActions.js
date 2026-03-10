import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';
import { useState, useCallback } from 'react'; 

export function useAlertasActions(recarregarDashboard) {
  
  // Marcar quota como paga
  const marcarQuotaPaga = async (quotaId) => {
    const loadingToast = toast.loading('Marcando quota como paga...');
    
    try {
      const quotaRef = doc(db, 'quotas', quotaId);
      await updateDoc(quotaRef, {
        pago: true,
        updatedAt: new Date(),
      });
      
      toast.success('Quota marcada como paga!', { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao marcar quota como paga:', error);
      toast.error('Erro ao atualizar quota', { id: loadingToast });
      return false;
    }
  };

  // Aprovar captação
const aprovarCaptacao = async (captacaoId) => {
  try {
    // 1. Busca dados da captação
    const captacaoDoc = await getDoc(doc(db, "captacoes", captacaoId));
    const captacao = { id: captacaoId, ...captacaoDoc.data() };

    if (!captacao) {
      alert("❌ Captação não encontrada");
      return false;
    }

    // 2. CONFIRMAÇÃO
    if (!window.confirm(`Aprovar "${captacao.nome}" e criar atleta no escalão ${captacao.escalao}?`)) {
      return false;
    }

    // 3. CRIAR ATLETA
    const novoAtleta = {
      nome: captacao.nome,
      idade: parseInt(captacao.idade),
      escalao: captacao.escalao,
      telemovel: captacao.telemovel || "",
      email: captacao.email || "",
      encarregadoNome: captacao.encarregadoNome || "",
      encarregadoTelefone: captacao.encarregadoTelefone || "",
      dataIncricao: new Date().toISOString(),
      ativo: true,
      origemCaptacao: captacaoId,
    };

    await addDoc(collection(db, "atletas"), novoAtleta);

    // 4. Atualizar escalão
    await updateDoc(doc(db, "escaloes", captacao.escalao), {
      atletas: arrayUnion(captacao.nome)
    });

    // 5. Marcar captação como aprovada
    await updateDoc(doc(db, "captacoes", captacaoId), {
      aprovadoDirecao: "sim",
      dataAprovacao: new Date().toISOString(),
      estado: "aprovado"
    });

    recarregarDashboard();
    alert("✅ Atleta criado com sucesso!");
    return true;
  } catch (err) {
    console.error("Erro ao aprovar:", err);
    alert("❌ Erro: " + err.message);
    return false;
  }
};

  // Rejeitar captação
  const rejeitarCaptacao = async (captacaoId) => {
    const loadingToast = toast.loading('Rejeitando captação...');
    
    try {
      const captacaoRef = doc(db, 'captacoes', captacaoId);
      await updateDoc(captacaoRef, {
        aprovadoDirecao: 'rejeitado',
        dataRejeicao: new Date().toISOString(),
      });
      
      toast.success('Captação rejeitada', { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar captação:', error);
      toast.error('Erro ao rejeitar captação', { id: loadingToast });
      return false;
    }
  };

  // Marcar atleta como contactado
  const marcarAtletaContactado = async (atletaId, motivo) => {
    const loadingToast = toast.loading('Registando contacto...');
    
    try {
      const atletaRef = doc(db, 'atletas', atletaId);
      const agora = new Date().toISOString();
      
      await updateDoc(atletaRef, {
        ultimoContacto: agora,
        motivoContacto: motivo,
        updatedAt: new Date(),
      });
      
      toast.success('Contacto registado!', { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao registar contacto:', error);
      toast.error('Erro ao registar contacto', { id: loadingToast });
      return false;
    }
  };

  // Enviar lembrete de pagamento
  const enviarLembretePagamento = async (quotaId) => {
    const loadingToast = toast.loading('Enviando lembrete...');
    
    try {
      const quotaRef = doc(db, 'quotas', quotaId);
      await updateDoc(quotaRef, {
        lembreteEnviado: true,
        dataLembrete: new Date().toISOString(),
      });
      
      toast.success('Lembrete enviado!', { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      toast.error('Erro ao enviar lembrete', { id: loadingToast });
      return false;
    }
  };

  // Dispensar alerta temporariamente
  const dispensarAlerta = async (tipo, itemId, dias = 7) => {
    const loadingToast = toast.loading('Dispensando alerta...');
    
    try {
      let collectionName;
      switch (tipo) {
        case 'quota':
          collectionName = 'quotas';
          break;
        case 'atleta':
          collectionName = 'atletas';
          break;
        case 'captacao':
          collectionName = 'captacoes';
          break;
        default:
          return false;
      }

      const itemRef = doc(db, collectionName, itemId);
      const dataDispensa = new Date();
      dataDispensa.setDate(dataDispensa.getDate() + dias);

      await updateDoc(itemRef, {
        alertaDispensadoAte: dataDispensa.toISOString(),
      });

      toast.success(`Alerta dispensado por ${dias} dias`, { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao dispensar alerta:', error);
      toast.error('Erro ao dispensar alerta', { id: loadingToast });
      return false;
    }
  };

  return {
    marcarQuotaPaga,
    aprovarCaptacao,
    rejeitarCaptacao,
    marcarAtletaContactado,
    enviarLembretePagamento,
    dispensarAlerta,
  };
}
