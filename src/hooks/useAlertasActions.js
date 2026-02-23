import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';

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
    const loadingToast = toast.loading('Aprovando captação...');
    
    try {
      const captacaoRef = doc(db, 'captacoes', captacaoId);
      await updateDoc(captacaoRef, {
        aprovadoDirecao: 'aprovado',
        dataAprovacao: new Date().toISOString(),
      });
      
      toast.success('Captação aprovada!', { id: loadingToast });
      recarregarDashboard();
      return true;
    } catch (error) {
      console.error('Erro ao aprovar captação:', error);
      toast.error('Erro ao aprovar captação', { id: loadingToast });
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
