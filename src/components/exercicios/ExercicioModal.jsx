import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  CATEGORIAS_EXERCICIOS,
  CONTEXTOS_EXERCICIOS,
  NIVEIS_EXERCICIOS,
} from "../../constants/exercicios";

export default function ExercicioModal({ exercicio, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    grupoMuscular: "",
    contexto: "",
    nivel: "iniciacao",
    descricaoCurta: "",
    instrucoes: "",
    equipamento: "",
    tags: "",
    videoUrl: "",
  });

  useEffect(() => {
    if (exercicio) {
      setForm({
        nome: exercicio.nome || "",
        categoria: exercicio.categoria || "",
        grupoMuscular: exercicio.grupoMuscular || "",
        contexto: exercicio.contexto || "",
        nivel: exercicio.nivel || "iniciacao",
        descricaoCurta: exercicio.descricaoCurta || "",
        instrucoes: exercicio.instrucoes || "",
        equipamento: (exercicio.equipamento || []).join(", "),
        tags: (exercicio.tags || []).join(", "),
        videoUrl: exercicio.videoUrl || "",
      });
    }
  }, [exercicio]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    const data = {
      nome: form.nome.trim(),
      categoria: form.categoria || null,
      grupoMuscular: form.grupoMuscular.trim() || null,
      contexto: form.contexto || null,
      nivel: form.nivel || "iniciacao",
      descricaoCurta: form.descricaoCurta.trim() || null,
      instrucoes: form.instrucoes.trim() || null,
      equipamento: form.equipamento
        ? form.equipamento.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: form.tags
        ? form.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [],
      videoUrl: form.videoUrl.trim() || null,
    };

    onSave(data);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">
            {exercicio ? "Editar Exercício" : "Novo Exercício"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-5">
          {/* Linha nome + grupo muscular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nome do exercício *
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={handleChange("nome")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Grupo muscular
              </label>
              <input
                type="text"
                value={form.grupoMuscular}
                onChange={handleChange("grupoMuscular")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                placeholder="Ex: Quadríceps, Ombro, Core"
              />
            </div>
          </div>

          {/* Linha categoria / contexto / nível */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={form.categoria}
                onChange={handleChange("categoria")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              >
                <option value="">Selecionar…</option>
                {CATEGORIAS_EXERCICIOS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contexto
              </label>
              <select
                value={form.contexto}
                onChange={handleChange("contexto")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              >
                <option value="">Selecionar…</option>
                {CONTEXTOS_EXERCICIOS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nível
              </label>
              <select
                value={form.nivel}
                onChange={handleChange("nivel")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              >
                {NIVEIS_EXERCICIOS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descrição curta */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Descrição curta
            </label>
            <input
              type="text"
              value={form.descricaoCurta}
              onChange={handleChange("descricaoCurta")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              placeholder="Ex: Fortalecimento unilateral de perna com foco em estabilidade do joelho."
            />
          </div>

          {/* Instruções */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Instruções / como executar
            </label>
            <textarea
              value={form.instrucoes}
              onChange={handleChange("instrucoes")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              rows={4}
              placeholder="Descreve os passos principais do exercício."
            />
          </div>

          {/* Equipamento e tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Equipamento (separar por vírgulas)
              </label>
              <input
                type="text"
                value={form.equipamento}
                onChange={handleChange("equipamento")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                placeholder="Ex: Banda elástica, Caixa pliométrica"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tags (separar por vírgulas)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={handleChange("tags")}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
                placeholder="Ex: joelho, salto, aterragem"
              />
            </div>
          </div>

          {/* Vídeo */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Vídeo (Drive/YouTube) – opcional
            </label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={handleChange("videoUrl")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#f5c623] focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0b1635] text-white text-sm font-medium hover:bg-[#152452]"
            >
              {exercicio ? "Guardar alterações" : "Criar exercício"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
