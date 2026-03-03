import { useState } from 'react';

export default function ModalAtleta({ 
  show, 
  onClose, 
  escaloes, 
  editingAtleta = null,
  onSubmit 
}) {
  const [formData, setFormData] = useState(
    editingAtleta || {
      nome: "",
      idade: "",
      equipa: "",
      posicao: "",
      telefone: "",
      email: "",
      fotoUrl: "",
       documentos: editingAtleta?.documentos || { cc: "", exameMedico: "" }, // 👈 Optional chaining
      observacoes: "",
    }
  );

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {editingAtleta ? "Adicionar Atleta" : "Adicionar Atleta"}
          </h2>
        </div>

        <form onSubmit={(e) => onSubmit(e, formData)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idade *
              </label>
              <input
                type="number"
                value={formData.idade}
                onChange={(e) =>
                  setFormData({ ...formData, idade: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipa *
              </label>
              <select
                value={formData.equipa}
                onChange={(e) =>
                  setFormData({ ...formData, equipa: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              >
                <option value="">Selecionar equipa</option>
                {escaloes.map((esc) => (
                  <option key={esc.id} value={esc.nome}>
                    {esc.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posição
              </label>
              <input
                type="text"
                value={formData.posicao}
                onChange={(e) =>
                  setFormData({ ...formData, posicao: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL da Foto
              </label>
              <input
                type="url"
                value={formData.fotoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fotoUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cartão de Cidadão
              </label>
              <input
                type="text"
                value={formData.documentos?.cc || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documentos: {
                      ...formData.documentos,
                      cc: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exame Médico
              </label>
              <input
                type="text"
                value={formData.documentos?.exameMedico || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documentos: {
                      ...formData.documentos,
                      exameMedico: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    observacoes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {editingAtleta ? "Guardar Alterações" : "Adicionar Atleta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
