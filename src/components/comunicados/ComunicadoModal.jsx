import { X, Save, Eye, Calendar, User, Tag, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CATEGORIAS, getCategoriaConfig } from '../../constants/comunicados';

const ComunicadoModal = ({ 
  comunicado, 
  escaloes,
  modo, // 'view', 'create', 'edit'
  onClose, 
  onSave,
  user 
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    resumo: '',
    categoria: 'geral',
    imagemUrl: '',
    tags: [],
    escaloes: [], // null = todos
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (comunicado && modo !== 'create') {
      setFormData({
        titulo: comunicado.titulo || '',
        conteudo: comunicado.conteudo || '',
        resumo: comunicado.resumo || '',
        categoria: comunicado.categoria || 'geral',
        imagemUrl: comunicado.imagemUrl || '',
        tags: comunicado.tags || [],
        escaloes: comunicado.escaloes || [],
      });
    }
  }, [comunicado, modo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const toggleEscalao = (escalao) => {
    setFormData(prev => {
      const atual = prev.escaloes || [];
      if (atual.includes(escalao)) {
        return { ...prev, escaloes: atual.filter(e => e !== escalao) };
      } else {
        return { ...prev, escaloes: [...atual, escalao] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.conteudo.trim()) {
      alert('Preencha o título e o conteúdo');
      return;
    }

    await onSave(formData);
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Modo Visualização
  if (modo === 'view') {
    const categoriaConfig = getCategoriaConfig(comunicado.categoria);

    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com Imagem */}
          {comunicado.imagemUrl && (
            <div
              className="h-64 bg-cover bg-center rounded-t-2xl"
              style={{ backgroundImage: `url(${comunicado.imagemUrl})` }}
            />
          )}

          {/* Conteúdo */}
          <div className="p-6 md:p-8">
            {/* Categoria Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                {categoriaConfig.label}
              </span>
              {comunicado.pinned && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                  📌 Fixado
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {comunicado.titulo}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Por <strong>{comunicado.autor}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatarData(comunicado.dataCriacao)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{comunicado.visualizacoes || 0} visualizações</span>
              </div>
            </div>

            {/* Tags */}
            {comunicado.tags && comunicado.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-slate-500" />
                <div className="flex flex-wrap gap-2">
                  {comunicado.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Escalões */}
            {comunicado.escaloes && comunicado.escaloes.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📢 Comunicado dirigido a:
                </p>
                <div className="flex flex-wrap gap-2">
                  {comunicado.escaloes.map((escalao, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {escalao}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo */}
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
                {comunicado.conteudo}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

    // Modo Criar/Editar
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {modo === 'edit' ? 'Editar Comunicado' : 'Novo Comunicado'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-base bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
              placeholder="Ex: Convocatória para Torneio Regional"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoria *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, categoria: cat.value }))}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                    ${formData.categoria === cat.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resumo (preview nos cards)
            </label>
            <textarea
              name="resumo"
              value={formData.resumo}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-slate-400"
              placeholder="Breve descrição que aparecerá no card..."
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              name="conteudo"
              value={formData.conteudo}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-slate-400"
              placeholder="Escreva o conteúdo completo do comunicado..."
            />
          </div>

          {/* URL da Imagem */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              name="imagemUrl"
              value={formData.imagemUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
              placeholder="https://..."
            />
            {formData.imagemUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                <img 
                  src={formData.imagemUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '';
                    e.target.alt = 'URL inválida';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e);
                  }
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                placeholder="Adicionar tag... (Enter para confirmar)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-500 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Escalões */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dirigido a (deixe vazio para todos)
            </label>
            <div className="flex flex-wrap gap-2">
              {escaloes.map((escalao) => (
                <button
                  key={escalao.id}
                  type="button"
                  onClick={() => toggleEscalao(escalao.nome)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all
                    ${formData.escaloes.includes(escalao.nome)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }
                  `}
                >
                  {escalao.nome}
                </button>
              ))}
            </div>
            {formData.escaloes.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">
                💡 Comunicado será visível para todos os escalões
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {modo === 'edit' ? 'Atualizar' : 'Publicar'} Comunicado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComunicadoModal;
