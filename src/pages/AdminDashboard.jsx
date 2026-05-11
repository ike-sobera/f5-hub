import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, BookOpen, FileText, LayoutGrid } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tools: 0, prompts: 0, trends: 0, docs: 0, totalCopies: 0 });
  const [recentTools, setRecentTools] = useState([]);
  const [topPrompts, setTopPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tools, prompts, trends, docs, recent, topPromptsData, totalCopiesData] = await Promise.all([
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('prompts').select('*', { count: 'exact', head: true }),
        supabase.from('trends').select('*', { count: 'exact', head: true }),
        supabase.from('docs').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('name, category').order('created_at', { ascending: false }).limit(5),
        supabase.from('prompts').select('id, prompt, copies').order('copies', { ascending: false }).limit(5),
        supabase.from('prompts').select('copies')
      ]);

      const totalCopiesCount = totalCopiesData.data?.reduce((acc, curr) => acc + (curr.copies || 0), 0) || 0;

      setStats({
        tools: tools.count || 0,
        prompts: prompts.count || 0,
        trends: trends.count || 0,
        docs: docs.count || 0,
        totalCopies: totalCopiesCount
      });
      setRecentTools(recent.data || []);
      setTopPrompts(topPromptsData.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title text-primary">Admin Dashboard</h1>
          <p className="page-subtitle text-support">Visão geral do ecossistema f5 Hub.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        <div className="stats-box">
          <div className="admin-card-icon" style={{ marginBottom: 16 }}><LayoutGrid size={24} /></div>
          <span className="stats-num">{stats.tools}</span>
          <span className="stats-label">Ferramentas</span>
        </div>
        <div className="stats-box">
          <div className="admin-card-icon" style={{ marginBottom: 16 }}><BookOpen size={24} /></div>
          <span className="stats-num">{stats.prompts}</span>
          <span className="stats-label">Prompts</span>
        </div>
        <div className="stats-box">
          <div className="admin-card-icon" style={{ marginBottom: 16 }}><TrendingUp size={24} /></div>
          <span className="stats-num">{stats.trends}</span>
          <span className="stats-label">Trends</span>
        </div>
        <div className="stats-box">
          <div className="admin-card-icon" style={{ marginBottom: 16 }}><FileText size={24} /></div>
          <span className="stats-num">{stats.docs}</span>
          <span className="stats-label">Docs</span>
        </div>
        <div className="stats-box">
          <div className="admin-card-icon" style={{ marginBottom: 16 }}><BarChart3 size={24} /></div>
          <span className="stats-num">{stats.totalCopies}</span>
          <span className="stats-label">Cópias de Prompts</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart3 size={20} className="text-accent" /> Últimas Atividades
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTools.map((t, i) => (
              <div key={i} className="list-item-simple" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-accent">✦</span>
                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                </div>
                <span className="badge-tiny user">{t.category}</span>
              </div>
            ))}
            {recentTools.length === 0 && <p style={{ color: 'var(--text-support)', textAlign: 'center', padding: '20px' }}>Nenhuma ferramenta recente encontrada.</p>}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart3 size={20} className="text-accent" /> Top 5 Prompts Mais Copiados
          </h3>
          <div className="bar-chart" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topPrompts.map((p, i) => {
              const maxCopies = Math.max(...topPrompts.map(pr => pr.copies || 1));
              const width = ((p.copies || 0) / maxCopies) * 100;
              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span className="text-primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.prompt}</span>
                    <span className="text-support">{p.copies || 0} cópias</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${width}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {topPrompts.length === 0 && <p style={{ color: 'var(--text-support)', textAlign: 'center', padding: '20px' }}>Nenhum dado disponível.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
