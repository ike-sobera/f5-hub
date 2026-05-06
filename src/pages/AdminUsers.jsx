import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Users, Shield, Calendar, RefreshCw } from 'lucide-react';

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const toggleAdmin = async (profile) => {
    const isAdmin = profile.email === 'henrique@f5estrategia.com.br';
    if (isAdmin) {
      toast.error('Não é possível alterar o nível do Super Admin.');
      return;
    }

    // This is a simulation or real update if the table supports a 'role' column
    // For now, we assume the user might want to update a 'role' column if it exists
    // If not, we show a message that RLS might be needed
    toast.info('Funcionalidade de troca de Role em desenvolvimento no Supabase.');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title text-primary">Gestão de Usuários</h1>
          <p className="page-subtitle text-support">Controle de acesso e histórico de login.</p>
        </div>
        <button className="btn-icon" onClick={fetchProfiles} title="Recarregar" style={{ flexShrink: 0 }}><RefreshCw size={18} /></button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Primeiro Acesso</th>
              <th>Nível</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, i) => (
              <tr key={i} className="admin-table-row">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="author-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      {p.email?.charAt(0).toUpperCase()}
                    </div>
                    <span>{p.email}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-support)', fontSize: '13px' }}>
                    <Calendar size={14} />
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td>
                  <span className={`badge-tiny ${p.email === 'henrique@f5estrategia.com.br' ? 'admin' : 'user'}`}>
                    {p.email === 'henrique@f5estrategia.com.br' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td>
                  <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => toggleAdmin(p)}>
                    Alterar Nível
                  </button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && !loading && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-support)' }}>
                  Nenhum usuário registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
