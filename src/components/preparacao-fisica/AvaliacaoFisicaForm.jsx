// src/components/preparacao-fisica/AvaliacaoFisicaForm.jsx
import { useState } from 'react';
import { X, Activity, TrendingUp, Zap, Target } from 'lucide-react';

export default function AvaliacaoFisicaForm({ atleta, onClose, onSave, avaliacaoExistente = null }) {
  const [formData, setFormData] = useState(avaliacaoExistente || {
    // Antropometria
    peso: '',
    altura: '',
    massaGorda: '',
    massaMuscular: '',
    
    // Testes de Força
    pesoMorto1RM: '',
    agachamento1RM: '',
    apertoDeMaoEsquerda: '',
    apertoDeMaoDireita: '',
    saltoVertical: '',
    saltoVerticalAproximacao: '',
    medicineballThrow: '',
    
    // Velocidade e Agilidade
    sprint10m: '',
    sprint20m: '',
    tTest: '',
    
    // Resistência
    yoYoTest: '',
    cooperTest: '',
    
    // Flexibilidade
    sitAndReach: '',
    
    // Observações
    observacoes: '',
    proximaAvaliacao: ''
  });

  const [secaoAberta, setSecaoAberta] = useState('antropometria');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const avaliacaoData = {
      atletaId: atleta.id,
      atletaNome: atleta.nome,
      atletaEscalao: atleta.escalao,
      data: new Date().toISOString(),
      ...formData,
      criadoEm: new Date().toISOString()
    };
    
    await onSave(avaliacaoData);
  };

  const SecaoAccordion = ({ id, titulo, icone: Icone, children }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setSecaoAberta(secaoAberta === id ? null : id)}
        className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icone className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-semibold text-slate-900">{titulo}</span>
        </div>
        <span className="text-slate-400">
          {secaoAberta === id ? '−' : '+'}
        </span>
      </button>
      
      {secaoAberta === id && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {avaliacaoExistente ? 'Editar Avaliação Física' : 'Nova Avaliação Física'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {atleta.nome} • {atleta.escalao}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Antropometria */}
          <SecaoAccordion id="antropometria" titulo="Antropometria" icone={Activity}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="72.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  name="altura"
                  value={formData.altura}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="178"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  % Massa Gorda
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="massaGorda"
                  value={formData.massaGorda}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Massa Muscular (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="massaMuscular"
                  value={formData.massaMuscular}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45.2"
                />
              </div>
            </div>
          </SecaoAccordion>

          {/* Testes de Força */}
          <SecaoAccordion id="forca" titulo="Testes de Força" icone={TrendingUp}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    1RM Peso Morto (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="pesoMorto1RM"
                    value={formData.pesoMorto1RM}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    1RM Agachamento (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="agachamento1RM"
                    value={formData.agachamento1RM}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">Aperto de Mão (kg)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Mão Esquerda</label>
                    <input
                      type="number"
                      step="0.5"
                      name="apertoDeMaoEsquerda"
                      value={formData.apertoDeMaoEsquerda}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="42"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Mão Direita</label>
                    <input
                      type="number"
                      step="0.5"
                      name="apertoDeMaoDireita"
                      value={formData.apertoDeMaoDireita}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="45"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salto Vertical (cm)
                  </label>
                  <input
                    type="number"
                    name="saltoVertical"
                    value={formData.saltoVertical}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="58"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salto c/ Aproximação (cm)
                  </label>
                  <input
                    type="number"
                    name="saltoVerticalAproximacao"
                    value={formData.saltoVerticalAproximacao}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="68"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Medicine Ball Throw (metros)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="medicineballThrow"
                  value={formData.medicineballThrow}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8.5"
                />
              </div>
            </div>
          </SecaoAccordion>

          {/* Velocidade e Agilidade */}
          <SecaoAccordion id="velocidade" titulo="Velocidade e Agilidade" icone={Zap}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sprint 10m (segundos)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="sprint10m"
                  value={formData.sprint10m}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.85"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sprint 20m (segundos)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="sprint20m"
                  value={formData.sprint20m}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="3.42"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  T-Test (segundos)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="tTest"
                  value={formData.tTest}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="9.8"
                />
              </div>
            </div>
          </SecaoAccordion>

          {/* Resistência */}
          <SecaoAccordion id="resistencia" titulo="Testes de Resistência" icone={Target}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Yo-Yo Intermittent Test (metros)
                </label>
                <input
                  type="number"
                  name="yoYoTest"
                  value={formData.yoYoTest}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1840"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cooper Test (metros)
                </label>
                <input
                  type="number"
                  name="cooperTest"
                  value={formData.cooperTest}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2650"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sit and Reach (cm)
                </label>
                <input
                  type="number"
                  name="sitAndReach"
                  value={formData.sitAndReach}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="28"
                />
              </div>
            </div>
          </SecaoAccordion>

          {/* Observações */}
          <div className="border border-slate-200 rounded-xl p-4 mb-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observações Gerais
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Notas sobre a avaliação..."
            />
          </div>

          <div className="border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Próxima Avaliação
            </label>
            <input
              type="date"
              name="proximaAvaliacao"
              value={formData.proximaAvaliacao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            {avaliacaoExistente ? 'Atualizar' : 'Guardar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  );
}
