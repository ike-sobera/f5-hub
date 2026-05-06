import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="gradient-mesh"></div>
      <div className="grid-wrapper">
        <div className="grid-background"></div>
        <div className="grid-glow"></div>
      </div>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 32px', textAlign: 'center' }}>
        <img src="./assets/logo/LOGO.png" alt="f5 IA & Design Hub" style={{ height: '48px', marginBottom: '24px' }} />
        <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '8px' }}>f5 AI & Design Hub</h1>
        <p className="page-subtitle" style={{ marginBottom: '32px' }}>Faça login com seu e-mail corporativo para acessar.</p>
        
        <button 
          className="btn-primary" 
          onClick={signInWithGoogle}
          style={{ width: '100%', padding: '12px', fontSize: '16px' }}
        >
          Entrar com Google Corporativo
        </button>
      </div>
    </div>
  );
}
