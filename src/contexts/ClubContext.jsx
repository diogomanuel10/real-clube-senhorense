import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const ClubContext = createContext(null);

export const ClubProvider = ({ children }) => {
  const [clubId, setClubId] = useState('senhorense');
  const [clubConfig, setClubConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tenta team_id da URL
    const urlParams = new URLSearchParams(window.location.search);
    const teamIdFromUrl = urlParams.get('team_id');

    // 2. Fallback hostname
    const hostname = window.location.hostname;
    const map = {
      'rc-senhorense-voleibol.web.app': 'senhorense',
      'real-clube-senhorense.pt': 'senhorense',
      'localhost': 'senhorense',
      'localhost:3000': 'senhorense',
      'demo.clubside.pt': 'demo',
    };

    const detected = teamIdFromUrl || map[hostname] || 'senhorense';
    setClubId(detected);

    // 3. Carrega config do clube do Firestore
    const loadConfig = async () => {
      try {
        const configRef = doc(db, `clubs/${detected}/config`, 'config');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setClubConfig({ id: detected, ...configSnap.data() });
        }
      } catch (err) {
        console.error('Erro ao carregar config do clube:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ClubContext.Provider value={{ clubId, clubConfig, loading }}>
      {children}
    </ClubContext.Provider>
  );
};

// Hook para usar em qualquer componente
export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) throw new Error('useClub deve ser usado dentro de ClubProvider');
  return context;
};
