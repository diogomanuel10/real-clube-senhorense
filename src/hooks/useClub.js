// src/hooks/useClub.js (atualiza)
import { useEffect, useState } from 'react';

export const useClub = () => {
  const [clubId, setClubId] = useState('senhorense');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tenta team_id da URL (como tens hoje)
    const urlParams = new URLSearchParams(window.location.search);
    const teamIdFromUrl = urlParams.get('team_id');
    
    // 2. Fallback para hostname
    const hostname = window.location.hostname;
    
    const map = {
      'rc-senhorense-voleibol.web.app': 'senhorense',
      'real-clube-senhorense.pt': 'senhorense',
      'localhost': 'senhorense',
      'localhost:3000': 'senhorense',
    };

    const detected = teamIdFromUrl || map[hostname] || 'senhorense';
    setClubId(detected);
    setLoading(false);
  }, []);

  return { clubId, loading };
};
