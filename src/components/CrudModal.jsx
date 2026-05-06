import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function CrudModal({ isOpen, onClose, type, item, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let error;
    let savedRecord = null;

    if (item) {
      // Update
      const { data, error: err } = await supabase.from(type).update(formData).eq('id', item.id).select();
      error = err;
      if (data) savedRecord = data[0];
    } else {
      // Insert
      const { data, error: err } = await supabase.from(type).insert([formData]).select();
      error = err;
      if (data) savedRecord = data[0];
    }

    setLoading(false);
    
    if (error) {
      toast.error('Erro ao salvar', { description: error.message });
    } else {
      toast.success('Salvo com sucesso!');
      onSuccess(savedRecord || formData); // Usa o registro retornado do banco (com ID real e defaults)
      onClose();
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'tools':
        return (
          <>
            <input name="name" placeholder="Nome da Ferramenta" value={formData.name || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <input name="category" placeholder="Categoria" value={formData.category || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <textarea name="desc" placeholder="Descrição Curta" value={formData.desc || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12, minHeight: 80, resize: 'vertical'}} />
            <select name="status" value={formData.status || 'Adotar'} onChange={handleChange} className="comment-input" style={{marginBottom: 12}}>
              <option value="Adotar">Adotar</option>
              <option value="Experimentar">Experimentar</option>
              <option value="Avaliar">Avaliar</option>
            </select>
          </>
        );
      case 'prompts':
        return (
          <>
            <input name="category" placeholder="Categoria" value={formData.category || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <input name="tool" placeholder="Ferramenta Alvo (Ex: Claude)" value={formData.tool || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <textarea name="prompt" placeholder="O Prompt" value={formData.prompt || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12, minHeight: 120, resize: 'vertical'}} />
            <input name="dica" placeholder="Dica de Uso (opcional)" value={formData.dica || ''} onChange={handleChange} className="comment-input" style={{marginBottom: 12}} />
          </>
        );
      case 'trends':
        return (
          <>
            <input name="title" placeholder="Título" value={formData.title || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <input name="tipo" placeholder="Tipo (Ex: Novo Fluxo)" value={formData.tipo || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <input type="date" name="date" value={formData.date ? formData.date.split('T')[0] : ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <textarea name="text" placeholder="Conteúdo" value={formData.text || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12, minHeight: 80, resize: 'vertical'}} />
            <input name="author" placeholder="Autor" value={formData.author || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
          </>
        );
      case 'docs':
        return (
          <>
            <input name="title" placeholder="Título do Documento" value={formData.title || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <input name="link" placeholder="Link (Drive/Youtube/Docs)" value={formData.link || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
            <textarea name="desc" placeholder="Descrição" value={formData.desc || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12, minHeight: 80, resize: 'vertical'}} />
            <input name="author" placeholder="Autor" value={formData.author || ''} onChange={handleChange} required className="comment-input" style={{marginBottom: 12}} />
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="glass modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}><X size={20} /></button>
        <h2 className="modal-title" style={{marginBottom: '24px'}}>{item ? 'Editar' : 'Adicionar Novo'}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {renderFields()}
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
