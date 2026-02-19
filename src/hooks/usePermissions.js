// src/hooks/usePermissions.jsx
import { useState, useEffect } from 'react';

export function usePermissions(user) {
  const [permissions, setPermissions] = useState({
    loading: true,
    isAdmin: false,
    isDirecao: false,
    isTreinador: false,
    isFisio: false, // ✅ NOVO
    isAtleta: false,
    equipas: [],
  });

  useEffect(() => {
    if (!user) {
      setPermissions({
        loading: false,
        isAdmin: false,
        isDirecao: false,
        isTreinador: false,
        isFisio: false, // ✅ NOVO
        isAtleta: false,
        equipas: [],
      });
      return;
    }

    const role = user.role?.toLowerCase();
    const equipas = Array.isArray(user.equipas) ? user.equipas : [];

    setPermissions({
      loading: false,
      isAdmin: role === 'admin',
      isDirecao: role === 'direcao',
      isTreinador: role === 'treinador',
      isFisio: role === 'fisio' || role === 'fisioterapeuta', // ✅ NOVO
      isAtleta: role === 'atleta',
      equipas,
    });
  }, [user]);

  const canViewEquipa = (equipa) => {
    if (permissions.isAdmin || permissions.isDirecao || permissions.isFisio) return true; 
    if (permissions.isTreinador) {
      return permissions.equipas.includes(equipa);
    }
    return false;
  };

  const filterByEquipa = (items, equipaField = 'equipa') => {
    if (permissions.isAdmin || permissions.isDirecao || permissions.isFisio) return items;
    if (permissions.isTreinador) {
      return items.filter(item => permissions.equipas.includes(item[equipaField]));
    }
    return items;
  };

  return {
    ...permissions,
    canViewEquipa,
    filterByEquipa,
  };
}
