<<<<<<< HEAD
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../../utils/firebase";

const AvaliacaoFisicaForm = ({ atleta, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('antropometria');

  const [formData, setFormData] = useState({

=======
// src/components/preparacao-fisica/AvaliacaoFisicaForm.jsx
import { useState } from 'react';
import { X, Activity, TrendingUp, Zap, Target } from 'lucide-react';

export default function AvaliacaoFisicaForm({ atleta, onClose, onSave, avaliacaoExistente = null }) {
  const [formData, setFormData] = useState(avaliacaoExistente || {
    // Antropometria
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
    peso: '',
    altura: '',
    massaGorda: '',
    massaMuscular: '',
<<<<<<< HEAD
    perimetros: {
      peitoral: '',
      cintura: '',
      anca: '',
      coxaEsquerda: '',
      coxaDireita: '',
      bracoEsquerdo: '',
      bracoDireito: ''
    },


    testesForça: {
      pesoMorto1RM: '',
      agachamento1RM: '',
      supinoReto1RM: '',
      apertoDeMaoEsquerda: '',
      apertoDeMaoDireita: '',
      medicineballThrow: '',
      saltoVertical: '',
      saltoVerticalComAproximacao: '',
      pranchaPeito: '',
      pranchaLateralEsquerda: '',
      pranchaLateralDireita: ''
    },


    testesVelocidade: {
      sprint10m: '',
      sprint20m: '',
      tTest: '',
      illinoisTest: '',
      deslocamentoLateral5m: '',
      aceleracaoParaBloqueio: ''
    },

    // Resistência
    testesResistencia: {
      yoYoIntermittent: '',
      cooperTest: '',
      sequenciaSaltos30seg: '',
      fcMaximo: '',
      fc1minDepois: '',
      fc2minDepois: ''
    },

    // Flexibilidade
    testesFlexibilidade: {
      sitAndReach: '',
      rotacaoExternaOmbro: '',
      rotacaoInternaOmbro: '',
      flexaoOmbro: '',
      abducaoOmbro: '',
      flexaoQuadril: '',
      extensaoQuadril: '',
      rotacaoExternaQuadril: '',
      agachamentoProfundo: '',
      overheadSquat: ''
    },

=======
    
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
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
    observacoes: '',
    proximaAvaliacao: ''
  });

<<<<<<< HEAD
  const calcularIMC = () => {
    if (formData.peso && formData.altura) {
      const alturaM = formData.altura / 100;
      return (formData.peso / (alturaM * alturaM)).toFixed(1);
    }
    return '';
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
=======
  const [secaoAberta, setSecaoAberta] = useState('antropometria');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setLoading(true);

    try {
      const avaliacaoData = {
        atletaId: atleta.id,
        atletaNome: atleta.nome,
        data: serverTimestamp(),

        antropometria: {
          peso: parseFloat(formData.peso) || null,
          altura: parseFloat(formData.altura) || null,
          imc: parseFloat(calcularIMC()) || null,
          massaGorda: parseFloat(formData.massaGorda) || null,
          massaMuscular: parseFloat(formData.massaMuscular) || null,
          perimetros: {
            peitoral: parseFloat(formData.perimetros.peitoral) || null,
            cintura: parseFloat(formData.perimetros.cintura) || null,
            anca: parseFloat(formData.perimetros.anca) || null,
            coxaEsquerda: parseFloat(formData.perimetros.coxaEsquerda) || null,
            coxaDireita: parseFloat(formData.perimetros.coxaDireita) || null,
            bracoEsquerdo: parseFloat(formData.perimetros.bracoEsquerdo) || null,
            bracoDireito: parseFloat(formData.perimetros.bracoDireito) || null
          }
        },

        testesForça: {
          pesoMorto1RM: parseFloat(formData.testesForça.pesoMorto1RM) || null,
          agachamento1RM: parseFloat(formData.testesForça.agachamento1RM) || null,
          supinoReto1RM: parseFloat(formData.testesForça.supinoReto1RM) || null,
          apertoDeMao: {
            esquerda: parseFloat(formData.testesForça.apertoDeMaoEsquerda) || null,
            direita: parseFloat(formData.testesForça.apertoDeMaoDireita) || null
          },
          medicineballThrow: parseFloat(formData.testesForça.medicineballThrow) || null,
          saltoVertical: parseFloat(formData.testesForça.saltoVertical) || null,
          saltoVerticalComAproximacao: parseFloat(formData.testesForça.saltoVerticalComAproximacao) || null,
          pranchaPeito: parseFloat(formData.testesForça.pranchaPeito) || null,
          pranchaLateral: {
            esquerda: parseFloat(formData.testesForça.pranchaLateralEsquerda) || null,
            direita: parseFloat(formData.testesForça.pranchaLateralDireita) || null
          }
        },

        testesVelocidade: {
          sprint10m: parseFloat(formData.testesVelocidade.sprint10m) || null,
          sprint20m: parseFloat(formData.testesVelocidade.sprint20m) || null,
          tTest: parseFloat(formData.testesVelocidade.tTest) || null,
          illinoisTest: parseFloat(formData.testesVelocidade.illinoisTest) || null,
          deslocamentoLateral5m: parseFloat(formData.testesVelocidade.deslocamentoLateral5m) || null,
          aceleracaoParaBloqueio: parseFloat(formData.testesVelocidade.aceleracaoParaBloqueio) || null
        },

        testesResistencia: {
          yoYoIntermittent: parseFloat(formData.testesResistencia.yoYoIntermittent) || null,
          cooperTest: parseFloat(formData.testesResistencia.cooperTest) || null,
          sequenciaSaltos30seg: parseFloat(formData.testesResistencia.sequenciaSaltos30seg) || null,
          recuperacaoFC: {
            fcMaximo: parseFloat(formData.testesResistencia.fcMaximo) || null,
            fc1minDepois: parseFloat(formData.testesResistencia.fc1minDepois) || null,
            fc2minDepois: parseFloat(formData.testesResistencia.fc2minDepois) || null
          }
        },

        testesFlexibilidade: {
          sitAndReach: parseFloat(formData.testesFlexibilidade.sitAndReach) || null,
          mobilidadeOmbros: {
            rotacaoExterna: parseFloat(formData.testesFlexibilidade.rotacaoExternaOmbro) || null,
            rotacaoInterna: parseFloat(formData.testesFlexibilidade.rotacaoInternaOmbro) || null,
            flexao: parseFloat(formData.testesFlexibilidade.flexaoOmbro) || null,
            abducao: parseFloat(formData.testesFlexibilidade.abducaoOmbro) || null
          },
          mobilidadeQuadril: {
            flexao: parseFloat(formData.testesFlexibilidade.flexaoQuadril) || null,
            extensao: parseFloat(formData.testesFlexibilidade.extensaoQuadril) || null,
            rotacaoExterna: parseFloat(formData.testesFlexibilidade.rotacaoExternaQuadril) || null
          },
          agachamentoProfundo: formData.testesFlexibilidade.agachamentoProfundo || null,
          overheadSquat: formData.testesFlexibilidade.overheadSquat || null
        },

        observacoes: formData.observacoes,
        proximaAvaliacao: formData.proximaAvaliacao ? new Date(formData.proximaAvaliacao) : null,
        criadoEm: serverTimestamp()
      };

      await addDoc(collection(db, 'avaliacoes_fisicas'), avaliacaoData);

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar avaliação física:', error);
      alert('Erro ao criar avaliação física. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'antropometria', label: 'Antropometria' },
    { id: 'forca', label: 'Testes de Força' },
    { id: 'velocidade', label: 'Velocidade e Agilidade' },
    { id: 'resistencia', label: 'Resistência' },
    { id: 'flexibilidade', label: 'Flexibilidade' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-stretch sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-lg sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-4 sm:p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nova Avaliação Física</h2>
            <p className="text-sm text-gray-500 mt-1">{atleta.nome} - {new Date().toLocaleDateString('pt-PT')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b bg-gray-50 px-2 sm:px-6 overflow-x-auto no-scrollbar flex-shrink-0">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${activeSection === section.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >

          {/* Antropometria */}
          {activeSection === 'antropometria' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => handleInputChange(null, 'peso', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.altura}
                    onChange={(e) => handleInputChange(null, 'altura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IMC
                  </label>
                  <input
                    type="text"
                    value={calcularIMC()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    % Massa Gorda
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.massaGorda}
                    onChange={(e) => handleInputChange(null, 'massaGorda', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Perímetros (cm)</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peitoral</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.peitoral}
                      onChange={(e) => handleInputChange('perimetros', 'peitoral', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cintura</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.cintura}
                      onChange={(e) => handleInputChange('perimetros', 'cintura', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anca</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.anca}
                      onChange={(e) => handleInputChange('perimetros', 'anca', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coxa Esquerda</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.coxaEsquerda}
                      onChange={(e) => handleInputChange('perimetros', 'coxaEsquerda', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coxa Direita</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.coxaDireita}
                      onChange={(e) => handleInputChange('perimetros', 'coxaDireita', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Braço Esquerdo</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.bracoEsquerdo}
                      onChange={(e) => handleInputChange('perimetros', 'bracoEsquerdo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Braço Direito</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.perimetros.bracoDireito}
                      onChange={(e) => handleInputChange('perimetros', 'bracoDireito', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testes de Força */}
          {activeSection === 'forca' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1RM (One Rep Max)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso Morto (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.testesForça.pesoMorto1RM}
                      onChange={(e) => handleInputChange('testesForça', 'pesoMorto1RM', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agachamento (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.testesForça.agachamento1RM}
                      onChange={(e) => handleInputChange('testesForça', 'agachamento1RM', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supino Reto (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.testesForça.supinoReto1RM}
                      onChange={(e) => handleInputChange('testesForça', 'supinoReto1RM', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Força Funcional</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aperto Mão Esquerda (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.testesForça.apertoDeMaoEsquerda}
                      onChange={(e) => handleInputChange('testesForça', 'apertoDeMaoEsquerda', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aperto Mão Direita (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.testesForça.apertoDeMaoDireita}
                      onChange={(e) => handleInputChange('testesForça', 'apertoDeMaoDireita', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Ball Throw (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.testesForça.medicineballThrow}
                      onChange={(e) => handleInputChange('testesForça', 'medicineballThrow', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Força Explosiva (Voleibol)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salto Vertical (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.testesForça.saltoVertical}
                      onChange={(e) => handleInputChange('testesForça', 'saltoVertical', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salto c/ Aproximação (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.testesForça.saltoVerticalComAproximacao}
                      onChange={(e) => handleInputChange('testesForça', 'saltoVerticalComAproximacao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Força Isométrica</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prancha Peito (seg)</label>
                    <input
                      type="number"
                      value={formData.testesForça.pranchaPeito}
                      onChange={(e) => handleInputChange('testesForça', 'pranchaPeito', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prancha Lateral Esq (seg)</label>
                    <input
                      type="number"
                      value={formData.testesForça.pranchaLateralEsquerda}
                      onChange={(e) => handleInputChange('testesForça', 'pranchaLateralEsquerda', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prancha Lateral Dir (seg)</label>
                    <input
                      type="number"
                      value={formData.testesForça.pranchaLateralDireita}
                      onChange={(e) => handleInputChange('testesForça', 'pranchaLateralDireita', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Velocidade e Agilidade */}
          {activeSection === 'velocidade' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testes de Velocidade</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sprint 10m (seg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.testesVelocidade.sprint10m}
                      onChange={(e) => handleInputChange('testesVelocidade', 'sprint10m', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sprint 20m (seg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.testesVelocidade.sprint20m}
                      onChange={(e) => handleInputChange('testesVelocidade', 'sprint20m', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testes de Agilidade</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">T-Test (seg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.testesVelocidade.tTest}
                      onChange={(e) => handleInputChange('testesVelocidade', 'tTest', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Illinois Test (seg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.testesVelocidade.illinoisTest}
                      onChange={(e) => handleInputChange('testesVelocidade', 'illinoisTest', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Específico Voleibol</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deslocamento Lateral 5m (seg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.testesVelocidade.deslocamentoLateral5m}
                      onChange={(e) => handleInputChange('testesVelocidade', 'deslocamentoLateral5m', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aceleração p/ Bloqueio (seg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.testesVelocidade.aceleracaoParaBloqueio}
                      onChange={(e) => handleInputChange('testesVelocidade', 'aceleracaoParaBloqueio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resistência */}
          {activeSection === 'resistencia' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testes de Resistência</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yo-Yo Intermittent (m)</label>
                    <input
                      type="number"
                      value={formData.testesResistencia.yoYoIntermittent}
                      onChange={(e) => handleInputChange('testesResistencia', 'yoYoIntermittent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teste de Cooper (m em 12min)</label>
                    <input
                      type="number"
                      value={formData.testesResistencia.cooperTest}
                      onChange={(e) => handleInputChange('testesResistencia', 'cooperTest', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resistência Específica Voleibol</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sequência de Saltos 30seg (nº saltos)</label>
                  <input
                    type="number"
                    value={formData.testesResistencia.sequenciaSaltos30seg}
                    onChange={(e) => handleInputChange('testesResistencia', 'sequenciaSaltos30seg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recuperação de Frequência Cardíaca</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FC Máximo (bpm)</label>
                    <input
                      type="number"
                      value={formData.testesResistencia.fcMaximo}
                      onChange={(e) => handleInputChange('testesResistencia', 'fcMaximo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FC 1min depois (bpm)</label>
                    <input
                      type="number"
                      value={formData.testesResistencia.fc1minDepois}
                      onChange={(e) => handleInputChange('testesResistencia', 'fc1minDepois', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FC 2min depois (bpm)</label>
                    <input
                      type="number"
                      value={formData.testesResistencia.fc2minDepois}
                      onChange={(e) => handleInputChange('testesResistencia', 'fc2minDepois', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flexibilidade */}
          {activeSection === 'flexibilidade' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Teste Geral</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sit and Reach (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.testesFlexibilidade.sitAndReach}
                    onChange={(e) => handleInputChange('testesFlexibilidade', 'sitAndReach', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
=======
    
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
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
                  />
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobilidade de Ombros (graus)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotação Externa</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.rotacaoExternaOmbro}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'rotacaoExternaOmbro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotação Interna</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.rotacaoInternaOmbro}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'rotacaoInternaOmbro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flexão</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.flexaoOmbro}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'flexaoOmbro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abdução</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.abducaoOmbro}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'abducaoOmbro', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobilidade de Quadril (graus)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flexão</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.flexaoQuadril}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'flexaoQuadril', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Extensão</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.extensaoQuadril}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'extensaoQuadril', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rotação Externa</label>
                    <input
                      type="number"
                      value={formData.testesFlexibilidade.rotacaoExternaQuadril}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'rotacaoExternaQuadril', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testes Funcionais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agachamento Profundo</label>
                    <select
                      value={formData.testesFlexibilidade.agachamentoProfundo}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'agachamentoProfundo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecionar...</option>
                      <option value="Passa">Passa</option>
                      <option value="Não Passa">Não Passa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Squat - Observações</label>
                    <input
                      type="text"
                      value={formData.testesFlexibilidade.overheadSquat}
                      onChange={(e) => handleInputChange('testesFlexibilidade', 'overheadSquat', e.target.value)}
                      placeholder="Ex: Compensações no ombro direito"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Observações e Data */}
          <div className="mt-6 pt-6 border-t space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações Gerais
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange(null, 'observacoes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas sobre a avaliação, contexto, limitações encontradas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Próxima Avaliação
              </label>
              <input
                type="date"
                value={formData.proximaAvaliacao}
                onChange={(e) => handleInputChange(null, 'proximaAvaliacao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
=======
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
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
          </div>
        </form>

        {/* Footer */}
<<<<<<< HEAD
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
=======
        <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
          >
            Cancelar
          </button>
          <button
<<<<<<< HEAD
            type="submit"
            form="" // ou remove se já usas onSubmit no form
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? 'A guardar...' : 'Guardar Avaliação'}
=======
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            {avaliacaoExistente ? 'Atualizar' : 'Guardar Avaliação'}
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
          </button>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default AvaliacaoFisicaForm;
=======
}
>>>>>>> ea79ffb2f08a6999afcc4ed6b21260bda50c7d8f
