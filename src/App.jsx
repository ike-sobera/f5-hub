import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Copy, Check, X, HelpCircle, MessageSquare, ThumbsUp, ThumbsDown, Target, Plus, Trash2, LogOut, Settings as SettingsIcon, LayoutGrid, BookOpen, TrendingUp, FileText, User, BarChart3, Users, Download, Shield, Zap, Search, CheckCircle, Eye, Info } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';

// Components & Pages
import CrudModal from './components/CrudModal';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import './index.css';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = d.toLocaleString('pt-BR', { month: 'long' });
    const year = d.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  } catch(e) { return dateStr; }
};

const formatExactDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')} de ${d.toLocaleString('pt-BR', { month: 'long' })}, ${d.getFullYear()}`;
  } catch(e) { return dateStr; }
};

const isVideoLink = (url) => {
  if(!url) return false;
  return /youtube\.com|youtu\.be|drive\.google\.com\/file/i.test(url);
};

const getSmartUrl = (url) => {
  if(!url) return '';
  if(url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
  if(url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  if(url.includes('drive.google.com/file/d/')) return url.replace(/\/view.*$/, '/preview');
  return url.replace(/\/edit.*/, '/preview');
};

const ToolModal = ({ tool, currentUser, social, updateSocial, onClose }) => {
  const [newComment, setNewComment] = useState("");
  const handleVote = (type) => {
    updateSocial(prev => {
      const currentVote = prev.userVotes?.[currentUser];
      let newLikes = prev.likes || 0;
      let newDislikes = prev.dislikes || 0;
      const newVotes = { ...(prev.userVotes || {}) };
      if (currentVote === type) {
        if (type === 'like') newLikes--;
        if (type === 'dislike') newDislikes--;
        delete newVotes[currentUser];
      } else {
        if (currentVote === 'like') newLikes--;
        if (currentVote === 'dislike') newDislikes--;
        if (type === 'like') newLikes++;
        if (type === 'dislike') newDislikes++;
        newVotes[currentUser] = type;
      }
      return { ...prev, likes: newLikes, dislikes: newDislikes, userVotes: newVotes };
    });
  };
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    updateSocial(prev => ({ ...prev, comments: [...(prev.comments || []), { id: Date.now(), text: newComment, author: currentUser }] }));
    setNewComment("");
  };
  const userVote = social.userVotes?.[currentUser];
  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 1000}}>
      <div className="glass modal-content social-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 className="modal-title">{tool.name}</h2>
        <span className="badge">{tool.category || 'Geral'}</span>
        <p style={{margin: '24px 0', fontSize: '15px'}} className="text-support">{tool.desc}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={`like-btn ${userVote === 'like' ? 'active-like' : ''}`} onClick={() => handleVote('like')}>
            <ThumbsUp size={16} fill={userVote === 'like' ? 'currentColor' : 'none'} /> {social.likes || 0}
          </button>
          <button className={`like-btn dislike-btn ${userVote === 'dislike' ? 'active-dislike' : ''}`} onClick={() => handleVote('dislike')}>
            <ThumbsDown size={16} fill={userVote === 'dislike' ? 'currentColor' : 'none'} /> {social.dislikes || 0}
          </button>
        </div>
        <div className="comment-section" style={{marginTop: '32px'}}>
          <h3 style={{fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}><MessageSquare size={16} /> Comentários</h3>
          <div className="comment-list">
            {(social.comments || []).map(c => (
              <div key={c.id} className="comment-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><div className="author-avatar" style={{width: 20, height: 20, fontSize: 10}}>{c.author.charAt(0).toUpperCase()}</div><strong className="text-primary">{c.author.split('@')[0]}</strong></div>
                <div style={{ paddingLeft: 28 }} className="text-support">{c.text}</div>
              </div>
            ))}
          </div>
          <form className="comment-input-wrap" onSubmit={handleCommentSubmit}>
            <input className="comment-input" placeholder="Comentar..." value={newComment} onChange={e => setNewComment(e.target.value)} />
            <button type="submit" className="btn-primary">Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PromptCard = ({ item, onEdit, onDelete, isAdmin }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="glass-card prompt-card hover-actions-container" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onEdit(item)}>
      {isAdmin && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="btn-icon btn-icon-danger card-delete"><Trash2 size={14} /></button>
      )}
      <div className="prompt-header"><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span className="badge">{item.category}</span><span style={{ fontSize: '12px', color: 'var(--text-support)' }}>{item.tool}</span></div></div>
      <div className="prompt-content text-primary">{item.prompt}</div>
      <button className={copied ? "btn-outline" : "btn-primary"} onClick={(e) => { e.stopPropagation(); handleCopy(); }} style={{ width: '100%' }}>
        {copied ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar Prompt</>}
      </button>
    </div>
  );
};

export default function App() {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === 'henrique@f5estrategia.com.br';
  const navigate = useNavigate();
  const location = useLocation();

  const [tools, setTools] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [crudModal, setCrudModal] = useState({ isOpen: false, type: null, item: null });
  const [draggedToolId, setDraggedToolId] = useState(null);
  const [socialState, setSocialState] = useState({});

  const promptsRef = useRef(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isActive = (path) => location.pathname === path;

  const downloadBackup = async () => {
    toast.promise(async () => {
      const { data, error } = await supabase.from('tools').select('*');
      if (error) throw error;
      const headers = Object.keys(data[0]);
      const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'f5_hub_backup_ferramentas.csv';
      link.click();
      return 'Backup concluído!';
    }, { loading: 'Gerando backup...', success: d => d, error: e => `Erro: ${e.message}` });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const handleWheel = (e) => {
      if (promptsRef.current && promptsRef.current.contains(e.target)) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          
          // Normalize delta based on deltaMode (0: pixels, 1: lines, 2: pages)
          let delta = e.deltaY;
          if (e.deltaMode === 1) delta *= 40; // Approx pixels per line
          if (e.deltaMode === 2) delta *= 800; // Approx pixels per page
          
          // Increased multiplier to overcome scroll-snap-type: mandatory resistance
          // and ensure the movement is enough to reach the next snap point.
          promptsRef.current.scrollBy({
            left: delta * 2.5,
            behavior: 'auto'
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [t, p, tr, d, s] = await Promise.all([
        supabase.from('tools').select('*').order('created_at', { ascending: true }),
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        supabase.from('trends').select('*').order('date', { ascending: false }),
        supabase.from('docs').select('*').order('created_at', { ascending: false }),
        supabase.from('social_interactions').select('*')
      ]);
      if (t.data) setTools(t.data);
      if (p.data) setPrompts(p.data);
      if (tr.data) setTrends(tr.data);
      if (d.data) setDocs(d.data);
      if (s.data) {
        const social = {};
        s.data.forEach(r => { social[r.tool_id] = r.data; });
        setSocialState(social);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handlePromptScroll = () => {
    if (!promptsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = promptsRef.current;
    setScrollProgress((scrollLeft / (scrollWidth - clientWidth)) * 100);
    
    const carouselRect = promptsRef.current.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;
    
    let closest = 0;
    let min = Infinity;
    
    Array.from(promptsRef.current.children).forEach((c, i) => {
      const rect = c.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const d = Math.abs(carouselCenter - cardCenter);
      if (d < min) {
        min = d;
        closest = i;
      }
    });
    
    if (closest !== activePromptIndex) setActivePromptIndex(closest);
  };

  const handleCardClick = (i) => {
    setActivePromptIndex(i);
    promptsRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  };
  const handleDragStart = (e, id) => { e.dataTransfer.setData('toolId', id); setDraggedToolId(id); };
  const handleDragEnd = () => setDraggedToolId(null);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, s) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('toolId');
    if (id) {
      setTools(prev => prev.map(t => t.id == id ? { ...t, status: s } : t));
      await supabase.from('tools').update({ status: s }).eq('id', id);
    }
  };

  const openAddModal = (type) => setCrudModal({ isOpen: true, type, item: null });
  const openEditModal = (type, item) => setCrudModal({ isOpen: true, type, item });
  const handleDelete = async (type, id) => {
    if (window.confirm('Excluir permanentemente?')) {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (!error) {
        toast.success('Excluído');
        if (type === 'tools') setTools(prev => prev.filter(t => t.id !== id));
        if (type === 'prompts') setPrompts(prev => prev.filter(p => p.id !== id));
        if (type === 'trends') setTrends(prev => prev.filter(tr => tr.id !== id));
        if (type === 'docs') setDocs(prev => prev.filter(d => d.id !== id));
      }
    }
  };

  const handleCrudSuccess = (saved) => {
    const { type, item: isEdit } = crudModal;
    const upd = (set) => set(prev => isEdit ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved]);
    if (type === 'tools') upd(setTools);
    if (type === 'prompts') upd(setPrompts);
    if (type === 'trends') upd(setTrends);
    if (type === 'docs') upd(setDocs);
  };

  return (
    <div className="app-container">
      <div className="gradient-mesh"></div>
      <div className="grid-wrapper"><div className="grid-background"></div><div className="grid-glow"></div><div className="mouse-flare"></div></div>
      
      <aside className="sidebar">
        <div className="sidebar-logo"><img src="./assets/logo/LOGO.png" alt="f5" /><span>Design Hub</span></div>
        <nav className="sidebar-nav">
          <button className={`sidebar-link ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}><LayoutGrid size={18} /> Radar</button>
          <button className={`sidebar-link ${isActive('/prompts') ? 'active' : ''}`} onClick={() => navigate('/prompts')}><BookOpen size={18} /> Prompts</button>
          <button className={`sidebar-link ${isActive('/trends') ? 'active' : ''}`} onClick={() => navigate('/trends')}><TrendingUp size={18} /> Tendências</button>
          <button className={`sidebar-link ${isActive('/docs') ? 'active' : ''}`} onClick={() => navigate('/docs')}><FileText size={18} /> Docs</button>
          {isAdmin && (
            <div className="sidebar-admin-section">
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 8px' }}></div>
              <span className="sidebar-section-title">ADMINISTRAÇÃO</span>
              <button className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`} onClick={() => navigate('/admin/dashboard')}><BarChart3 size={18} /> Dashboard</button>
              <button className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`} onClick={() => navigate('/admin/users')}><Users size={18} /> Usuários</button>
              <button className="sidebar-link" onClick={downloadBackup}><Download size={18} /> Backup CSV</button>
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-secondary-nav" style={{ marginBottom: 8 }}>
            <button className="sidebar-link-secondary" onClick={() => setIsHelpModalOpen(true)}>
              <HelpCircle size={18} /> <span>Guia da Plataforma</span>
            </button>
            <button className="sidebar-link-secondary" onClick={() => setIsModalOpen(true)}>
              <Shield size={18} /> <span>Termos e Uso Ético</span>
            </button>
          </div>
          
          <button className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate('/settings')}><SettingsIcon size={18} /> Configurações</button>
          <div className="user-profile-sidebar glass">
            <div className="author-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
            <div className="user-info"><span className="user-name">{user?.user_metadata?.full_name || 'Usuário'}</span><span className="user-email">{user?.email}</span></div>
            <button className="btn-icon btn-icon-danger" onClick={signOut} style={{ marginLeft: 'auto' }}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="main-content-wrapper">
        <main className="main-content">
          {loading ? <div className="skeleton-wrap"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-subtitle"></div></div> : (
            <Routes>
              <Route path="/" element={
                <div className="animate-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h1 className="page-title text-primary">Radar de Ferramentas</h1>
                      <p className="page-subtitle text-support">Ecossistema validado pelo time f5.</p>
                    </div>
                    <button className="btn-primary" onClick={() => openAddModal('tools')} style={{ flexShrink: 0 }}><Plus size={16} /> Adicionar Novo</button>
                  </div>
                  <div className="kanban-board">
                    {['Adotar', 'Experimentar', 'Avaliar'].map(s => (
                      <div key={s} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, s)}>
                        <div className="kanban-col-header">{s}</div>
                        {tools.filter(t => t.status?.toLowerCase() === s.toLowerCase()).map(t => (
                          <div key={t.id} className={`glass-card tool-card ${draggedToolId === t.id ? 'is-dragging' : ''}`} draggable onDragStart={(e) => handleDragStart(e, t.id)} onDragEnd={handleDragEnd} onClick={() => openEditModal('tools', t)}>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDelete('tools', t.id); }} className="btn-icon btn-icon-danger card-delete"><Trash2 size={14} /></button>}
                            <h3 className="text-primary">{t.name}</h3><p className="tool-desc text-support">{t.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}><span className="badge">{t.category}</span><button onClick={(e) => { e.stopPropagation(); setSelectedTool(t); }} className="btn-icon"><MessageSquare size={14} /></button></div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="/prompts" element={
                <div className="animate-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h1 className="page-title text-primary">Biblioteca de Prompts</h1>
                      <p className="page-subtitle text-support">Melhores prompts em produção.</p>
                    </div>
                    <button className="btn-primary" onClick={() => openAddModal('prompts')} style={{ flexShrink: 0 }}><Plus size={16} /> Adicionar Novo</button>
                  </div>
                  <div className="prompts-carousel" ref={promptsRef} onScroll={handlePromptScroll}>{prompts.map((p, i) => <div key={p.id} className={`prompt-wrapper ${i === activePromptIndex ? 'active' : ''}`} onClick={() => handleCardClick(i)}><PromptCard item={p} isAdmin={isAdmin} onEdit={openEditModal.bind(null, 'prompts')} onDelete={handleDelete.bind(null, 'prompts')} /></div>)}</div>
                  <div className="scroll-indicator-container"><div className="scroll-track"><div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div></div></div>
                </div>
              } />
              <Route path="/trends" element={
                <div className="animate-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h1 className="page-title text-primary">Tendências</h1>
                      <p className="page-subtitle text-support">Evolução do time f5.</p>
                    </div>
                    <button className="btn-primary" onClick={() => openAddModal('trends')} style={{ flexShrink: 0 }}><Plus size={16} /> Adicionar Novo</button>
                  </div>
                  <div className="timeline">
                    {Object.entries(trends.reduce((acc, t) => { const g = formatDate(t.date) || 'Geral'; if(!acc[g]) acc[g] = []; acc[g].push(t); return acc; }, {})).map(([m, ts]) => (
                      <div key={m} className="timeline-group">
                        <h2 className="timeline-month text-primary">{m}</h2>
                        {ts.map(t => (
                          <div key={t.id} className="timeline-item" onClick={() => openEditModal('trends', t)}>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDelete('trends', t.id); }} className="btn-icon btn-icon-danger card-delete"><Trash2 size={14} /></button>}
                            {t.tipo && <div className="trend-badge"><Target size={14} /> <span>{t.tipo}</span></div>}
                            <span className="timeline-exact-date">{formatExactDate(t.date)}</span>
                            <h3 className="timeline-title text-primary">{t.title}</h3><p className="tool-desc text-support">{t.text}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              } />
              <Route path="/docs" element={
                <div className="animate-fade-in">
                  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <h1 className="page-title text-primary">Guias & Docs</h1>
                      <p className="page-subtitle text-support">Padrões e manuais oficiais.</p>
                    </div>
                    <button className="btn-primary" onClick={() => openAddModal('docs')} style={{ flexShrink: 0 }}><Plus size={16} /> Adicionar Novo</button>
                  </div>
                  <div className="docs-grid">{docs.map(d => (
                    <div key={d.id} className="glass-card doc-card" onClick={() => openEditModal('docs', d)}>
                      {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDelete('docs', d.id); }} className="btn-icon btn-icon-danger card-delete"><Trash2 size={14} /></button>}
                      <div className="doc-icon">📄</div><h3 className="text-primary">{d.title}</h3><p className="text-support">{d.desc}</p>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(d); }} className="btn-outline" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Acessar</button>
                    </div>
                  ))}</div>
                </div>
              } />
              <Route path="/settings" element={<Settings onBack={() => navigate('/')} />} />
              <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={isAdmin ? <AdminUsers /> : <Navigate to="/" />} />
            </Routes>
          )}
        </main>
      </div>

      {selectedTool && <ToolModal tool={selectedTool} currentUser={user?.email} social={socialState[selectedTool.id] || {}} updateSocial={(u) => { const id = selectedTool.id; setSocialState(prev => { const n = { ...prev, [id]: u(prev[id] || {}) }; supabase.from('social_interactions').upsert({ tool_id: id, data: n[id] }); return n; }); }} onClose={() => setSelectedTool(null)} />}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)} style={{zIndex: 2000}}>
          <div className="modal-content doc-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDoc(null)}><X size={24} /></button>
            <div className="iframe-container"><iframe src={getSmartUrl(selectedDoc.link)} title={selectedDoc.title} allowFullScreen /></div>
          </div>
        </div>
      )}

      {/* MODAL: Termos & Uso Ético */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{zIndex: 2000}}>
          <div className="glass modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: '40px' }}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            <div style={{ marginBottom: '32px' }}>
              <h2 className="modal-title text-primary" style={{ fontSize: '28px', marginBottom: '8px' }}>Termos & Uso Ético de IA</h2>
              <p className="text-support">Nossas diretrizes para o uso seguro e responsável de Inteligência Artificial na f5.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="modal-info-item">
                <div className="modal-info-icon"><Shield size={24} /></div>
                <div>
                  <h4 className="text-primary" style={{ marginBottom: '4px' }}>1. Sigilo Absoluto de Dados</h4>
                  <p className="text-support" style={{ fontSize: '14px', lineHeight: '1.6' }}>Nunca insira dados sensíveis, informações financeiras ou briefings confidenciais de clientes em IAs públicas sem a devida anonimização.</p>
                </div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-icon"><Zap size={24} /></div>
                <div>
                  <h4 className="text-primary" style={{ marginBottom: '4px' }}>2. A IA é o Copiloto, você é o Piloto</h4>
                  <p className="text-support" style={{ fontSize: '14px', lineHeight: '1.6' }}>A IA serve para acelerar a base e superar o bloqueio criativo. O refinamento e o acabamento final são responsabilidades exclusivas do talento f5.</p>
                </div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-icon"><Eye size={24} /></div>
                <div>
                  <h4 className="text-primary" style={{ marginBottom: '4px' }}>3. Revisão Obrigatória (Alucinações)</h4>
                  <p className="text-support" style={{ fontSize: '14px', lineHeight: '1.6' }}>IAs podem gerar informações falsas. Revise 100% do conteúdo gerado antes de qualquer aplicação em peças oficiais.</p>
                </div>
              </div>
              <div className="modal-info-item">
                <div className="modal-info-icon"><CheckCircle size={24} /></div>
                <div>
                  <h4 className="text-primary" style={{ marginBottom: '4px' }}>4. Direitos Autorais</h4>
                  <p className="text-support" style={{ fontSize: '14px', lineHeight: '1.6' }}>Tenha cautela ao gerar imagens que copiem explicitamente o estilo de artistas vivos ou marcas registradas de terceiros.</p>
                </div>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '40px', padding: '14px' }} onClick={() => setIsModalOpen(false)}>Entendi e Concordo</button>
          </div>
        </div>
      )}

      {/* MODAL: Guia da Plataforma */}
      {isHelpModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHelpModalOpen(false)} style={{zIndex: 2000}}>
          <div className="glass modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', padding: '40px' }}>
            <button className="modal-close" onClick={() => setIsHelpModalOpen(false)}><X size={24} /></button>
            <div style={{ marginBottom: '32px' }}>
              <h2 className="modal-title text-primary" style={{ fontSize: '28px', marginBottom: '8px' }}>Como usar o f5 AI & Design Hub</h2>
              <p className="text-support">Seu segundo cérebro para adoção de IA na agência.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-accent" style={{ marginBottom: '12px' }}><LayoutGrid size={24} /></div>
                <h4 className="text-primary" style={{ marginBottom: '8px' }}>Radar de Ferramentas</h4>
                <p className="text-support" style={{ fontSize: '13px', lineHeight: '1.5' }}>Nosso Kanban oficial. Acompanhe quais IAs o time está validando e quais já foram adotadas.</p>
              </div>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-accent" style={{ marginBottom: '12px' }}><BookOpen size={24} /></div>
                <h4 className="text-primary" style={{ marginBottom: '8px' }}>Biblioteca de Prompts</h4>
                <p className="text-support" style={{ fontSize: '13px', lineHeight: '1.5' }}>O fim do "copiar e colar". Encontre prompts testados. Clique no botão laranja para usar.</p>
              </div>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-accent" style={{ marginBottom: '12px' }}><TrendingUp size={24} /></div>
                <h4 className="text-primary" style={{ marginBottom: '8px' }}>Tendências</h4>
                <p className="text-support" style={{ fontSize: '13px', lineHeight: '1.5' }}>A linha do tempo da nossa evolução. Registramos aqui nossos marcos técnicos e de performance.</p>
              </div>
              <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-accent" style={{ marginBottom: '12px' }}><FileText size={24} /></div>
                <h4 className="text-primary" style={{ marginBottom: '8px' }}>Guias & Docs</h4>
                <p className="text-support" style={{ fontSize: '13px', lineHeight: '1.5' }}>Nossos Manuais e Playbooks de processos complexos documentados passo a passo.</p>
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '40px', padding: '14px' }} onClick={() => setIsHelpModalOpen(false)}>Entendi, Vamos Criar</button>
          </div>
        </div>
      )}

      <CrudModal isOpen={crudModal.isOpen} onClose={() => setCrudModal({ isOpen: false })} type={crudModal.type} item={crudModal.item} onSuccess={handleCrudSuccess} />
    </div>
  );
}
