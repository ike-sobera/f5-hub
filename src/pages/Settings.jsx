import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Mail, UserCheck, Shield } from 'lucide-react';

export default function Settings({ onBack }) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'henrique@f5estrategia.com.br';
  const avatar = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || 'Usuário';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 8, color: 'var(--text-support)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Gerencie seu perfil corporativo f5.</p>
        </div>
      </div>

      <div className="glass-card stagger-1" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
        {avatar ? (
          <img src={avatar} alt={fullName} style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--accent-color)' }} />
        ) : (
          <div className="author-avatar" style={{ width: 72, height: 72, fontSize: 28 }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{fullName}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-support)', fontSize: 14 }}>
            <Mail size={14} />
            <span>{user?.email}</span>
          </div>
          {isAdmin && (
            <span className="badge adotar" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Shield size={10} /> Admin
            </span>
          )}
        </div>
      </div>

      <div className="glass-card stagger-2">
        <h3 style={{ fontSize: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserCheck size={20} className="text-accent" /> Meus Dados
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div>
            <label className="label-tiny">Nome Completo</label>
            <div className="field-readonly">{fullName}</div>
          </div>
          <div>
            <label className="label-tiny">E-mail Corporativo</label>
            <div className="field-readonly">{user?.email}</div>
          </div>
          <div>
            <label className="label-tiny">Nível de Acesso</label>
            <div className="field-readonly">{isAdmin ? 'Administrador' : 'Colaborador'}</div>
          </div>
        </div>

        <div style={{ marginTop: '48px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-support)' }}>
            Configurações de segurança e API são gerenciadas centralizadamente pelo administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
