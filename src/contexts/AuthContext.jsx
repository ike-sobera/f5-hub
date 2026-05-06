import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session) => {
    if (session?.user) {
      const email = session.user.email;
      if (!email.endsWith('@f5estrategia.com.br')) {
        await supabase.auth.signOut();
        setUser(null);
        toast.error('Acesso restrito', {
          description: 'O Hub é exclusivo para colaboradores da f5.',
          duration: 5000,
        });
      } else {
        setUser(session.user);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error('Erro no login', { description: error.message });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Desconectado com sucesso');
    } catch (error) {
      toast.error('Erro ao sair', { description: error.message });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
