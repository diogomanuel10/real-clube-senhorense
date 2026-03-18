import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';  // ← ADICIONA
import { auth, db } from '../utils/firebase';        // ← IMPORTA auth + db

// 1️⃣ DEFINE O CONTEXT PRIMEIRO
export const ClubContext = createContext(null);

export const ClubProvider = ({ children }) => {
  const [clubId, setClubId] = useState(null);
  const [clubConfig, setClubConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log(user.uid)
          // PRIORIDADE 1: User profile
          const userDoc = await getDoc(doc(db, `utilizadores/${user.uid}`));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(userData)
            if (userData.clubeId) {
              console.log('✅ ClubId do USER:', userData.clubeId);
              setClubId(userData.clubeId);
              loadConfig(userData.clubeId);
              return;
            }
          }
        } catch (err) {
          console.error('Erro user clubId:', err);
        }
      }

      // PRIORIDADE 2: URL param ?team_id=
      const urlParams = new URLSearchParams(window.location.search);
      const teamIdFromUrl = urlParams.get('team_id');
      if (teamIdFromUrl) {
        console.log('🔗 ClubId da URL:', teamIdFromUrl);
        setClubId(teamIdFromUrl);
        loadConfig(teamIdFromUrl);
        return;
      }

      // PRIORIDADE 3: Hostname
      const hostname = window.location.hostname;
      const map = {
        'rc-senhorense-voleibol.web.app': 'senhorense',
        'real-clube-senhorense.pt': 'senhorense',
        'stamp.clubsidesite.pt': 'stamp',
        'localhost': 'senhorense',
        'demo.clubside.pt': 'demo',
      };
      const detected = map[hostname] || 'senhorense';
      console.log('🌐 ClubId hostname:', detected);
      setClubId(detected);
      loadConfig(detected);
    });

    return unsubscribe;
  }, []);

  const loadConfig = async (clubIdToLoad) => {
    try {
      const configRef = doc(db, `clubs/${clubIdToLoad}/config`, 'geral');
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        setClubConfig({ id: clubIdToLoad, ...configSnap.data() });
        applyClubTheme(config);
      }
    } catch (err) {
      console.error('Erro config:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClubContext.Provider value={{ clubId, clubConfig, loading }}>
      {children}
    </ClubContext.Provider>
  );
};

function applyClubTheme(config) {
  if (!config) return;
  const root = document.documentElement;

  const corPrimaria = config.corPrimaria || '#0b1635';
  const corDestaque = config.corDestaque || '#f5c623';

  root.style.setProperty('--cor-primaria', corPrimaria);
  root.style.setProperty('--cor-destaque', corDestaque);
  root.style.setProperty('--cor-primaria-light', corPrimaria + '22'); // 13% opacity
  root.style.setProperty('--cor-destaque-light', corDestaque + '33'); // 20% opacity
}


export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) throw new Error('useClub deve ser usado dentro de ClubProvider');
  return context;
};
