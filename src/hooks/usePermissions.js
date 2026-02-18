import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

export function usePermissions(user) {
  const [permissions, setPermissions] = useState({
    isAdmin: false,
    isDirecao: false,
    isTreinador: false,
    isAtleta: false,
    equipas: [],
    loading: true,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setPermissions({
          isAdmin: false,
          isDirecao: false,
          isTreinador: false,
          isAtleta: false,
          equipas: [],
          loading: false,
        });
        return;
      }

      try {
        // Buscar perfil do utilizador
        const q = query(
          collection(db, 'utilizadores'),
          where('email', '==', user.email)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const perfil = snap.docs[0].data();
          const role = perfil.role || perfil.perfil || 'viewer';
          
          setPermissions({
            isAdmin: role === 'admin',
            isDirecao: role === 'direcao',
            isTreinador: role === 'treinador',
            isAtleta: role === 'atleta',
            equipas: Array.isArray(perfil.equipas) ? perfil.equipas : [],
            loading: false,
          });
        } else {
          setPermissions({
            isAdmin: false,
            isDirecao: false,
            isTreinador: false,
            isAtleta: false,
            equipas: [],
            loading: false,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    };

    loadPermissions();
  }, [user]);

  // Função helper para verificar se pode ver uma equipa
  const canViewEquipa = (equipaNome) => {
    if (permissions.isAdmin || permissions.isDirecao) return true;
    if (permissions.isTreinador) {
      return permissions.equipas.includes(equipaNome);
    }
    return false;
  };

  // Função helper para filtrar items por equipa
  const filterByEquipa = (items, equipaField = 'equipa') => {
    if (permissions.isAdmin || permissions.isDirecao) return items;
    if (permissions.isTreinador && permissions.equipas.length > 0) {
      return items.filter(item => 
        permissions.equipas.includes(item[equipaField])
      );
    }
    return [];
  };

  return {
    ...permissions,
    canViewEquipa,
    filterByEquipa,
  };
}
