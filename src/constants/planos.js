// src/constants/planos.js

export const FEATURE_LIST = [
  { key: "captacoes", label: "Captações" },
  { key: "episodiosClinicos", label: "Episódios clínicos" },
  { key: "quotas", label: "Quotas" },
  { key: "jogoLive", label: "Jogo Live" },
  { key: "monitorizacaoFirebase", label: "Monitorização Firebase" },
];

export const PLANOS = [
  {
    id: "basic",
    label: "Basic (Grátis)",
    funcionalidades: {
      captacoes: false,
      episodiosClinicos: false,
      quotas: true,
      jogoLive: false,
      monitorizacaoFirebase: false,
    },
  },
  {
    id: "pro",
    label: "Pro (€29/mês)",
    funcionalidades: {
      captacoes: true,
      episodiosClinicos: true,
      quotas: true,
      jogoLive: true,
      monitorizacaoFirebase: true,
    },
  },
  {
    id: "enterprise",
    label: "Enterprise (€99/mês)",
    funcionalidades: {
      captacoes: true,
      episodiosClinicos: true,
      quotas: true,
      jogoLive: true,
      monitorizacaoFirebase: true,
    },
  },
];

export const getPlanoConfig = (planoId) =>
  PLANOS.find((p) => p.id === planoId) || PLANOS[0];

export const getPlanoFeatures = (planoId) =>
  getPlanoConfig(planoId).funcionalidades;

// 👉 Helper de acesso por plano
export const canUseFeature = (planoId, featureKey) => {
  const funcionalidades = getPlanoFeatures(planoId);
  return Boolean(funcionalidades?.[featureKey]);
};
