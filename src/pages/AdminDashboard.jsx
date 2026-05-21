import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, BookOpen, FileText, LayoutGrid, Award, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tools: 0, prompts: 0, trends: 0, docs: 0, totalCopies: 0 });
  const [recentTools, setRecentTools] = useState([]);
  const [topPrompts, setTopPrompts] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tools, prompts, trends, docs, recent, topPromptsData, totalCopiesData, allPromptsForGamification] = await Promise.all([
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('prompts').select('*', { count: 'exact', head: true }),
        supabase.from('trends').select('*', { count: 'exact', head: true }),
        supabase.from('docs').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('name, category').order('created_at', { ascending: false }).limit(5),
        supabase.from('prompts').select('id, title, prompt, copy_count').order('copy_count', { ascending: false }).limit(5),
        supabase.from('prompts').select('copy_count'),
        supabase.from('prompts').select('author, copy_count')
      ]);

      const totalCopiesCount = totalCopiesData.data?.reduce((acc, curr) => acc + (curr.copy_count || 0), 0) || 0;

      const authorStats = allPromptsForGamification.data?.reduce((acc, curr) => {
        const author = curr.author || 'Anônimo';
        acc[author] = (acc[author] || 0) + (curr.copy_count || 0);
        return acc;
      }, {});

      const contributorsRanking = Object.entries(authorStats || {})
        .map(([author, copies]) => ({ author, copies }))
        .sort((a, b) => b.copies - a.copies)
        .slice(0, 3);

      setStats({
        tools: tools.count || 0,
        prompts: prompts.count || 0,
        trends: trends.count || 0,
        docs: docs.count || 0,
        totalCopies: totalCopiesCount
      });
      setRecentTools(recent.data || []);
      setTopPrompts(topPromptsData.data || []);
      setTopContributors(contributorsRanking);
      setLoading(false);
    };
    fetchData();
  }, []);

  const hasInteractions = stats.totalCopies > 0 && topPrompts.some(p => (p.copy_count || 0) > 0);

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
            {!hasInteractions ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-support)' }}>
                <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '14px' }}>Aguardando interações da equipe</p>
              </div>
            ) : (
              topPrompts.map((p, i) => {
                const maxCopies = Math.max(...topPrompts.map(pr => pr.copy_count || 1));
                const width = ((p.copy_count || 0) / maxCopies) * 100;
                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span className="text-primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{p.title || p.prompt}</span>
                      <span className="text-support">{p.copy_count || 0} cópias</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${width}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={20} className="text-accent" /> Top Contribuidores
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {topContributors.length === 0 || !hasInteractions ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-support)' }}>
                <Award size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '14px' }}>Aguardando interações da equipe</p>
              </div>
            ) : (
              topContributors.map((c, i) => (
                <div key={i} className="list-item-simple" style={{ justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'rgba(222, 255, 154, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? 'var(--accent-color)' : 'var(--text-support)', fontWeight: 'bold', fontSize: '12px' }}>
                      {i + 1}
                    </div>
                    <span style={{ fontWeight: 500, color: i === 0 ? 'var(--accent-color)' : 'var(--text-primary)' }}>{c.author}</span>
                    {i === 0 && <Star size={16} fill="currentColor" className="text-accent" style={{ marginLeft: '4px' }} />}
                  </div>
                  <span className="badge-tiny" style={{ background: 'var(--neutral-900)', color: 'var(--accent-color)' }}>{c.copies} cópias</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
