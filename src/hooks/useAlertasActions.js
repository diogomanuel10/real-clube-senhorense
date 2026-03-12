import { doc, updateDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../utils/firebase';
import toast from 'react-hot-toast';
import { useClub } from '../contexts/ClubContext';

export function useAlertasActions(recarregarDashboard) {
  const { clubId } = useClub();

  const marcarQuotaPaga = async (quotaId) => {
    const loadingToast = toast.loading('Marcando quota como paga...');
    try {
      await updateDoc(doc(db, `clubs/${clubId}/quotas`, quotaId), { // ← NOVO
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

  const aprovarCaptacao = async (captacaoId) => {
    try {
      const captacaoDoc = await getDoc(doc(db, `clubs/${clubId}/captacoes`, captacaoId)); // ← NOVO
      const captacao = { id: captacaoId, ...captacaoDoc.data() };

      if (!captacao) { alert('❌ Captação não encontrada'); return false; }

      if (!window.confirm(`Aprovar "${captacao.nome}" e criar atleta no escalão ${captacao.escalao}?`)) return false;

      const novoAtleta = {
        nome: captacao.nome,
        idade: parseInt(captacao.idade),
        escalao: captacao.escalao,
        telemovel: captacao.telemovel || '',
        email: captacao.email || '',
        encarregadoNome: captacao.encarregadoNome || '',
        encarregadoTelefone: captacao.encarregadoTelefone || '',
        dataIncricao: new Date().toISOString(),
        ativo: true,
        origemCaptacao: captacaoId,
      };

      await addDoc(collection(db, `clubs/${clubId}/atletas`), novoAtleta); // ← NOVO

      await updateDoc(doc(db, `clubs/${clubId}/escaloes`, captacao.escalao), { // ← NOVO
        atletas: arrayUnion(captacao.nome)
      });

      await updateDoc(doc(db, `clubs/${clubId}/captacoes`, captacaoId), { // ← NOVO
        aprovadoDirecao: 'sim',
        dataAprovacao: new Date().toISOString(),
        estado: 'aprovado'
      });

      recarregarDashboard();
      alert('✅ Atleta criado com sucesso!');
      return true;
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('❌ Erro: ' + err.message);
      return false;
    }
  };

  const rejeitarCaptacao = async (captacaoId) => {
    const loadingToast = toast.loading('Rejeitando captação...');
    try {
      await updateDoc(doc(db, `clubs/${clubId}/captacoes`, captacaoId), { // ← NOVO
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

  const marcarAtletaContactado = async (atletaId, motivo) => {
    const loadingToast = toast.loading('Registando contacto...');
    try {
      await updateDoc(doc(db, `clubs/${clubId}/atletas`, atletaId), { // ← NOVO
        ultimoContacto: new Date().toISOString(),
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

  const enviarLembretePagamento = async (quotaId) => {
    const loadingToast = toast.loading('Enviando lembrete...');
    try {
      await updateDoc(doc(db, `clubs/${clubId}/quotas`, quotaId), { // ← NOVO
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

  const dispensarAlerta = async (tipo, itemId, dias = 7) => {
    const loadingToast = toast.loading('Dispensando alerta...');
    try {
      const collectionMap = {
        quota: 'quotas',
        atleta: 'atletas',
        captacao: 'captacoes',
      };
      const colName = collectionMap[tipo];
      if (!colName) return false;

      const dataDispensa = new Date();
      dataDispensa.setDate(dataDispensa.getDate() + dias);

      await updateDoc(doc(db, `clubs/${clubId}/${colName}`, itemId), { // ← NOVO
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
