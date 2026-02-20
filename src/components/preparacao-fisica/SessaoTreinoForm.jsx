import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../../utils/firebase";

const SessaoTreinoForm = ({ atleta, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipo: 'Força Máxima',
    duracao: '',
    exercicios: [
      { nome: '', series: '', repeticoes: '', carga: '', rpe: '', executado: true }
    ],
    bemEstar: {
      sono: 3,
      energia: 3,
      doresMusculares: 3,
      stress: 3,
      prontidao: 5
    },
    observacoes: ''
  });

  const tiposTreino = [
    'Força Máxima',
    'Força Explosiva',
    'Resistência',
    'Velocidade',
    'Agilidade',
    'Flexibilidade',
    'Regeneração',
    'Core',
    'Prevenção'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBemEstarChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bemEstar: {
        ...prev.bemEstar,
        [field]: parseInt(value)
      }
    }));
  };

  const handleExercicioChange = (index, field, value) => {
    const novosExercicios = [...formData.exercicios];
    novosExercicios[index][field] = value;
    setFormData(prev => ({
      ...prev,
      exercicios: novosExercicios
    }));
  };

  const adicionarExercicio = () => {
    setFormData(prev => ({
      ...prev,
      exercicios: [
        ...prev.exercicios,
        { nome: '', series: '', repeticoes: '', carga: '', rpe: '', executado: true }
      ]
    }));
  };

  const removerExercicio = (index) => {
    setFormData(prev => ({
      ...prev,
      exercicios: prev.exercicios.filter((_, i) => i !== index)
    }));
  };

  const calcularCargaTotal = () => {
    // Fórmula simples: soma de (séries * reps * RPE) de cada exercício
    return formData.exercicios.reduce((total, ex) => {
      if (ex.executado && ex.series && ex.repeticoes && ex.rpe) {
        return total + (parseInt(ex.series) * parseInt(ex.repeticoes) * parseInt(ex.rpe));
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sessaoData = {
        atletaId: atleta.id,
        atletaNome: atleta.nome,
        data: new Date(formData.data),
        tipo: formData.tipo,
        duracao: parseInt(formData.duracao) || null,
        exercicios: formData.exercicios.filter(ex => ex.nome),
        cargaTotal: calcularCargaTotal(),
        bemEstar: formData.bemEstar,
        observacoes: formData.observacoes,
        criadoEm: serverTimestamp()
      };

      await addDoc(collection(db, 'sessoes_treino_fisico'), sessaoData);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao registar sessão de treino:', error);
      alert('Erro ao registar sessão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registar Sessão de Treino</h2>
            <p className="text-sm text-gray-500 mt-1">{atleta.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Treino *</label>
              <select
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {tiposTreino.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
              <input
                type="number"
                value={formData.duracao}
                onChange={(e) => handleInputChange('duracao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
          </div>

          {/* Exercícios */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Exercícios</h3>
              <button
                type="button"
                onClick={adicionarExercicio}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                Adicionar Exercício
              </button>
            </div>

            <div className="space-y-3">
              {formData.exercicios.map((exercicio, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Nome do Exercício</label>
                      <input
                        type="text"
                        value={exercicio.nome}
                        onChange={(e) => handleExercicioChange(index, 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Agachamento Back Squat"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Séries</label>
                      <input
                        type="number"
                        value={exercicio.series}
                        onChange={(e) => handleExercicioChange(index, 'series', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="4"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Reps</label>
                      <input
                        type="text"
                        value={exercicio.repeticoes}
                        onChange={(e) => handleExercicioChange(index, 'repeticoes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Carga</label>
                      <input
                        type="text"
                        value={exercicio.carga}
                        onChange={(e) => handleExercicioChange(index, 'carga', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="70kg"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">RPE (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={exercicio.rpe}
                          onChange={(e) => handleExercicioChange(index, 'rpe', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="8"
                        />
                      </div>
                      
                      {formData.exercicios.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerExercicio(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={exercicio.executado}
                      onChange={(e) => handleExercicioChange(index, 'executado', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Executado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bem-Estar */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Bem-Estar e Prontidão</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Qualidade do Sono (1-5): <span className="font-semibold">{formData.bemEstar.sono}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.bemEstar.sono}
                  onChange={(e) => handleBemEstarChange('sono', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Péssimo</span>
                  <span>Ótimo</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nível de Energia (1-5): <span className="font-semibold">{formData.bemEstar.energia}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.bemEstar.energia}
                  onChange={(e) => handleBemEstarChange('energia', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Baixo</span>
                  <span>Alto</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Dores Musculares (1-5): <span className="font-semibold">{formData.bemEstar.doresMusculares}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.bemEstar.doresMusculares}
                  onChange={(e) => handleBemEstarChange('doresMusculares', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muita dor</span>
                  <span>Sem dor</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nível de Stress (1-5): <span className="font-semibold">{formData.bemEstar.stress}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.bemEstar.stress}
                  onChange={(e) => handleBemEstarChange('stress', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muito stress</span>
                  <span>Relaxado</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">
                  Prontidão para Treinar (1-10): <span className="font-semibold">{formData.bemEstar.prontidao}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.bemEstar.prontidao}
                  onChange={(e) => handleBemEstarChange('prontidao', e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muito baixa</span>
                  <span>Excelente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Como correu a sessão, pontos a melhorar, feedback do atleta..."
            />
          </div>

          {/* Carga Total Calculada */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Carga Total Estimada: <span className="text-lg font-bold text-blue-600">{calcularCargaTotal()}</span> unidades
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Calculada com base em séries × repetições × RPE de cada exercício executado
            </p>
          </div>
        </form>

        {/* Footer */}
       <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 ...">
            Cancelar
          </button>
         <button onClick={handleSubmit} className="w-full sm:w-auto px-4 py-2 ...">
            {loading ? 'A guardar...' : 'Guardar Sessão'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessaoTreinoForm;
