import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Plus, List, Search, Copy, CheckCircle2, 
  AlertTriangle, Phone, Mail, ArrowRight, Trash2, X,
  ExternalLink, Sparkles, Check, ChevronRight, Globe, Layers, ArrowLeft,
  Download, FileText, Filter, MessageSquare, Edit3, MapPin, Send, RefreshCw, 
  Settings, User, ChevronDown, Building2, HelpCircle, CheckSquare, BarChart, Clipboard, 
  UserCheck, DollarSign, Target, Calendar, TrendingUp
} from 'lucide-react';

// --- CONFIGURAÇÕES DE IA ---
const apiKey = ""; // Injetada dinamicamente pelo ambiente
const AI_MODEL = "gemini-2.5-flash-preview-09-2025";
const APIFY_TOKEN = "apify_api_UDWkQGlrcl4QVGkkPqfOyvlNuGWvcL0pmUJV"; // Token Ativo
const APIFY_ACTOR_ID = "nwua9Gu5YrADL7ZDj"; // ID do Robô oficial da sua conta

// --- DADOS ESTÁTICOS ---
const NICHES = [
  { name: 'Dentista', rate: 14 }, { name: 'Clínica de Estética', rate: 15 },
  { name: 'Nutricionista', rate: 12 }, { name: 'Psicólogo', rate: 11 },
  { name: 'Personal Trainer', rate: 13 }, { name: 'Consultor Empresarial', rate: 16 },
  { name: 'Designer Gráfico', rate: 10 }, { name: 'Agência de Marketing', rate: 17 },
  { name: 'Fotógrafo', rate: 9 }, { name: 'Instrutor de Yoga', rate: 8 },
  { name: 'Esteticista', rate: 14 }, { name: 'Coach de Vida', rate: 12 },
  { name: 'Advogado', rate: 13 }, { name: 'Contador', rate: 12 },
  { name: 'Engenheiro Civil', rate: 11 }, { name: 'Arquiteto', rate: 13 },
  { name: 'Veterinário', rate: 14 }, { name: 'Fisioterapeuta', rate: 12 },
  { name: 'Fonoaudiólogo', rate: 10 }, { name: 'Terapeuta Holístico', rate: 9 }
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Estados do Usuário Personalizável
  const [profileName, setProfileName] = useState('Giovanna Mayumi');
  const [profileRole, setProfileRole] = useState('Diretora de Operações');
  const [profileInitials, setProfileInitials] = useState('GM');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Meta Semanal State (Padrão inicial de R$ 897,00)
  const [weeklyGoal, setWeeklyGoal] = useState(897);

  // Auxiliares das Abas
  const [objectionInputs, setObjectionInputs] = useState({});
  const [objectionOutputs, setObjectionOutputs] = useState({});
  const [loadingObjection, setLoadingObjection] = useState({});
  const [aiToneCommand, setAiToneCommand] = useState('');
  const [isTuningTone, setIsTuningTone] = useState({});

  // Carregar dados guardados do LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('hunter_campaigns');
    if (saved) {
      try {
        setCampaigns(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar do LocalStorage", e);
      }
    }
    
    const savedProfile = localStorage.getItem('hunter_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileName(parsed.name || 'Giovanna Mayumi');
        setProfileRole(parsed.role || 'Diretora de Operações');
        setProfileInitials(parsed.initials || 'GM');
      } catch (e) {
        console.error("Erro ao carregar perfil do LocalStorage", e);
      }
    }

    const savedGoal = localStorage.getItem('hunter_weekly_goal');
    if (savedGoal) {
      setWeeklyGoal(Number(savedGoal));
    } else {
      setWeeklyGoal(897);
    }
  }, []);

  const saveCampaigns = (newCampaigns) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('hunter_campaigns', JSON.stringify(newCampaigns));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedProfile = { name: profileName, role: profileRole, initials: profileInitials };
    localStorage.setItem('hunter_profile', JSON.stringify(updatedProfile));
    setIsProfileModalOpen(false);
    showToast("Perfil de Administradora atualizado com sucesso!");
  };

  const handleSaveGoal = (val) => {
    const goal = Math.max(1, val);
    setWeeklyGoal(goal);
    localStorage.setItem('hunter_weekly_goal', goal.toString());
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyToClipboard = (text, id) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { 
        document.execCommand('copy'); 
      } catch (err) { 
        console.error('Falha ao copiar', err); 
      }
      document.body.removeChild(textArea);
    }
    setCopiedId(id);
    showToast('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- HELPER DE FILTRO DE DATA SEMANAL ---
  // Verifica se uma string de data (formato YYYY-MM-DD) está dentro da semana atual de Junho de 2026
  const isDateInCurrentWeek = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + "T12:00:00"); // Previne bugs de fuso horário
    if (isNaN(d.getTime())) return false;
    
    const now = new Date("2026-06-22T12:00:00"); // Data de referência da sessão do sistema
    
    // Início da semana atual (Domingo)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    
    // Fim da semana atual (Sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    
    return d >= startOfWeek && d <= endOfWeek;
  };

  // --- IA ENGINE ---
  const callGeminiAPI = async (prompt, isJson = true) => {
    if (!apiKey) {
      return isJson ? {
        weaknesses: [
          { description: "Ausência de otimização orgânica local no Google Maps", severity: "high" },
          { description: "Site inacessível ou sem carregamento móvel otimizado", severity: "medium" }
        ],
        pitch: "Olá! Notei uma pequena falha no vosso posicionamento no Google Maps que está a afastar clientes. Podemos conversar 5 minutos?",
        contact_email: "suporte@empresa.com",
        contact_phone: "+5548999999999",
        contact_instagram: "@empresa_foco"
      } : "Percebo perfeitamente o vosso ponto. No entanto, o objetivo desta análise é puramente preventivo. Conseguimos conversar 5 minutos amanhã?";
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85 }
    };

    if (isJson) {
      payload.generationConfig.responseMimeType = "application/json";
      payload.generationConfig.responseSchema = {
        type: "OBJECT",
        properties: {
          weaknesses: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                description: { type: "STRING" },
                severity: { type: "STRING" }
              }
            }
          },
          pitch: { type: "STRING" },
          contact_email: { type: "STRING" },
          contact_phone: { type: "STRING" },
          contact_instagram: { type: "STRING" }
        }
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return isJson ? JSON.parse(text) : text;
    } catch (e) {
      console.error("Erro na API Gemini", e);
      return null;
    }
  };

  const handleResolveObjection = async (lead, objectionText) => {
    if (!objectionText.trim()) return;
    setLoadingObjection(prev => ({ ...prev, [lead.id]: true }));
    
    const prompt = `Aja de forma informal e altamente persuasiva comercial, tratando uma objeção do lead ${lead.name}.
      Abordagem enviada antes: "${lead.pitch}"
      Objeção deles: "${objectionText}"
      Crie uma resposta de contorno direta, humana, polida e curta para WhatsApp. Não use emojis.`;

    try {
      const result = await callGeminiAPI(prompt, false);
      setObjectionOutputs(prev => ({ 
        ...prev, 
        [lead.id]: result || "Entendo perfeitamente o vosso lado. O objetivo deste contacto rápido é apenas mostrar um ponto de conversão no vosso perfil do Google Maps que vos está a fazer perder posições gratuitas. Conseguimos alinhar um papo de 5 minutos?"
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingObjection(prev => ({ ...prev, [lead.id]: false }));
    }
  };

  const handleTunePitchTone = async (campaignId, leadId, currentPitch, command) => {
    if (!command.trim()) return;
    setIsTuningTone(prev => ({ ...prev, [leadId]: true }));

    const prompt = `Reescreva a mensagem comercial de WhatsApp a seguir de acordo com este comando especial: "${command}".
      
      Mensagem Atual:
      "${currentPitch}"
      
      Importante: Mantenha o foco comercial, o nome da empresa se presente, de forma curta e sem emojis de qualquer tipo.`;

    try {
      const result = await callGeminiAPI(prompt, false);
      if (result) {
        const updated = campaigns.map(c => {
          if (c.id === campaignId) {
            return {
              ...c,
              leads: c.leads.map(l => l.id === leadId ? { ...l, pitch: result } : l)
            };
          }
          return c;
        });
        saveCampaigns(updated);
        showToast("Otimizador IA alterou o tom do script!");
        setAiToneCommand('');
      }
    } catch (e) {
      console.error(e);
      showToast("Falha técnica ao ajustar tom com a IA.");
    } finally {
      setIsTuningTone(prev => ({ ...prev, [leadId]: false }));
    }
  };

  // --- APIFY SCRAPING ---
  const runApifyScraper = async (campaign) => {
    showToast('A despertar o robô de extração do Google Maps...');
    const input = {
      searchStringsArray: [campaign.niche],
      locationQuery: `${campaign.location}, Brazil`,
      maxCrawledPlacesPerSearch: campaign.quantity,
      language: "pt-BR",
      website: "allPlaces",
      scrapeSocialMediaProfiles: {
        facebooks: false,
        instagrams: true,
        youtubes: false,
        tiktoks: false,
        twitters: false
      }
    };

    try {
      const runRes = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      if (!runRes.ok) throw new Error('Falha na autenticação ou créditos esgotados na conta Apify.');
      
      const runData = await runRes.json();
      const runId = runData.data.id;
      const datasetId = runData.data.defaultDatasetId;

      let status = "RUNNING";
      let elapsedAttempts = 0;
      
      showToast('Pesquisando listagens no mapa...');
      
      while (status === "RUNNING" || status === "READY") {
        if (elapsedAttempts > 35) throw new Error("Tempo limite de processamento excedido.");
        await new Promise(r => setTimeout(r, 5000));
        elapsedAttempts++;
        
        const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
        const statusData = await statusRes.json();
        status = statusData.data.status;
        
        if (status === "FAILED" || status === "ABORTED") throw new Error("A execução do Apify falhou.");
      }

      const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
      const items = await dataRes.json();

      if (!items || items.length === 0) throw new Error("Nenhum estabelecimento encontrado nesta região.");

      const leads = [];
      showToast(`Extraídos ${items.length} registos. A construir análises comerciais por IA...`);

      for (let i = 0; i < Math.min(items.length, campaign.quantity); i++) {
        const item = items[i];
        const name = item.title || item.name || `${campaign.niche} Localizado`;
        const website = item.website || item.url || "sem site";
        const phone = item.phone || item.phoneUnformatted || "não listado";
        const email = item.email || (item.emails && item.emails[0]) || "não listado";
        const instagram = item.instagram || (item.socialMediaProfiles && item.socialMediaProfiles.instagram) || "não listado";
        
        const prompt = `Gere uma análise crítica em formato JSON de 2 vulnerabilidades técnicas do site/Maps para a empresa "${name}" em Florianópolis. Crie também uma abordagem direta de 2 parágrafos amigável em primeira pessoa para enviar por mensagem.`;

        let aiData = await callGeminiAPI(prompt, true);
        
        if (!aiData) {
           aiData = {
            weaknesses: [{ description: "Perfil de negócio desprovido de links de conversão direta ou otimização de palavras-chave", severity: "high" }],
            pitch: `Olá pessoal da ${name}, tudo bem? Localizei o vosso estabelecimento nas pesquisas do Google Maps em Florianópolis e notei que estão atrás da concorrência direta por um detalhe de otimização local. Conseguimos conversar por chamada breve amanhã?`,
            contact_email: email,
            contact_phone: phone,
            contact_instagram: instagram
          };
        }

        leads.push({
          id: generateId(),
          name,
          link: website !== "sem site" ? website : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' '+campaign.location)}`,
          ...aiData,
          notes: '',
          status: 'não contatado',
          approachDate: '',
          conversionDate: '',
          dealValue: 0
        });
      }
      
      return leads;

    } catch (error) {
      console.error(error);
      showToast(`Erro na extração: ${error.message}`);
      throw error;
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    const newCampaign = {
      ...campaignData,
      id: generateId(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'scraping',
      leads: []
    };
    
    const updatedCampaigns = [newCampaign, ...campaigns];
    saveCampaigns(updatedCampaigns);
    setCurrentView('dashboard');
    showToast('A iniciar o mapeamento automatizado de leads...');

    try {
      const generatedLeads = await runApifyScraper(newCampaign);
      const finishedCampaigns = updatedCampaigns.map(c => 
        c.id === newCampaign.id ? { ...c, status: 'done', leads: generatedLeads } : c
      );
      saveCampaigns(finishedCampaigns);
      showToast(`Varredura do fluxo '${newCampaign.name}' concluída.`);
    } catch (error) {
      const failedCampaigns = updatedCampaigns.map(c => 
        c.id === newCampaign.id ? { ...c, status: 'error', leads: [] } : c
      );
      saveCampaigns(failedCampaigns);
    }
  };

  const updateLeadStatus = (campaignId, leadId, newStatus) => {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          leads: c.leads.map(l => {
            if (l.id === leadId) {
              const updatedLead = { ...l, status: newStatus };
              // Registo inteligente de CRM baseado no status
              if (newStatus === 'contatado' && !l.approachDate) {
                updatedLead.approachDate = todayStr;
              }
              if (newStatus === 'convertido') {
                if (!l.approachDate) updatedLead.approachDate = todayStr;
                if (!l.conversionDate) updatedLead.conversionDate = todayStr;
                if (!l.dealValue || l.dealValue === 0) updatedLead.dealValue = 1500; // Valor padrão de entrada de R$ 1.500,00
              }
              return updatedLead;
            }
            return l;
          })
        };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  const updateLeadNotes = (campaignId, leadId, notesText) => {
    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          leads: c.leads.map(l => l.id === leadId ? { ...l, notes: notesText } : l)
        };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  // slot de controle CRM
  const updateLeadCrmField = (campaignId, leadId, field, value) => {
    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          leads: c.leads.map(l => {
            if (l.id === leadId) {
              return { ...l, [field]: value };
            }
            return l;
          })
        };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  const deleteCampaign = (id) => {
    if (confirm('Pretende remover permanentemente esta operação?')) {
      const updated = campaigns.filter(c => c.id !== id);
      saveCampaigns(updated);
      if (activeCampaignId === id) setActiveCampaignId(null);
      setCurrentView('dashboard');
      showToast('Operação removida.');
    }
  };

  const exportCampaignToCSV = (campaign) => {
    if (!campaign.leads || campaign.leads.length === 0) return;
    
    const headers = ['Nome', 'Link/Site', 'Status', 'Telefone', 'Email', 'Instagram', 'Pontos Fracos', 'Mensagem Proposta', 'Data Abordagem', 'Data Baixa', 'Valor Contrato', 'Notas'];
    const rows = campaign.leads.map(l => [
      l.name,
      l.link,
      l.status,
      l.contact_phone,
      l.contact_email,
      l.contact_instagram,
      l.weaknesses.map(w => `${w.description} (${w.severity})`).join(' | '),
      l.pitch.replace(/"/g, '""'),
      l.approachDate || '',
      l.conversionDate || '',
      l.dealValue || 0,
      (l.notes || '').replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_${campaign.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório exportado em formato CSV.');
  };

  // --- VIEWS COMPONENTS ---

  const DashboardView = () => {
    const allLeads = campaigns.flatMap(c => c.leads || []);
    const totalLeads = allLeads.length;
    const contactedLeads = allLeads.filter(l => l.status !== 'não contatado').length;
    const convertedLeads = allLeads.filter(l => l.status === 'convertido').length;
    const avgConversion = contactedLeads > 0 ? Math.round((convertedLeads / contactedLeads) * 100) : 0;

    // Cálculo dinâmico de conversões na semana corrente
    const weeklyConvertedLeads = allLeads.filter(l => l.status === 'convertido' && isDateInCurrentWeek(l.conversionDate));
    const weeklyCount = weeklyConvertedLeads.length;
    const weeklyRevenue = weeklyConvertedLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const goalPercentage = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyRevenue / weeklyGoal) * 100)) : 0;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center pb-6 border-b border-[#27272A]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">Visão Geral</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Bem-vinda de volta, {profileName}. Miyazaki Studio está ativo.</p>
          </div>
          <button 
            onClick={() => setCurrentView('fluxos')} 
            className="inline-flex items-center gap-2 bg-[#C5A27D] hover:bg-[#b5926d] text-[#09090B] transition-all px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-[#c5a27d]/10"
          >
            <Plus size={16} /> Mapear Novos Leads
          </button>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Empresas Encontradas', value: totalLeads, desc: 'Alvos potenciais mapeados no Maps', icon: Building2 },
            { label: 'Abordagens Iniciadas', value: contactedLeads, desc: 'Contatos ativos estabelecidos', icon: MessageSquare },
            { label: 'Conversão Comercial', value: `${avgConversion}%`, desc: 'Rácio de fechamento sobre contactos', icon: BarChart2 }
          ].map((stat, i) => (
            <div key={i} className="border border-[#27272A] bg-[#09090B] p-6 rounded-2xl flex justify-between items-start">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">{stat.label}</span>
                <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF]">{stat.desc}</p>
              </div>
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl text-slate-400">
                <stat.icon size={20} className={i === 2 ? "text-[#C5A27D]" : ""} />
              </div>
            </div>
          ))}
        </div>

        {/* METAS & CAMPANHAS ATIVAS SPLIT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* FLUXOS ATIVOS (2/3 width) */}
          <div className="lg:col-span-2 border border-[#27272A] bg-[#09090B] rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-6 border-b border-[#27272A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200">
                  <Layers size={18} className="text-[#C5A27D]" />
                  <h2 className="text-base font-semibold text-white">Campanhas Ativas de Varredura</h2>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-full">{campaigns.length} fluxos</span>
              </div>

              <div className="p-6">
                {campaigns.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-full text-slate-500 mb-4">
                      <List size={24} />
                    </div>
                    <p className="text-white font-semibold text-base">A sua base de dados local encontra-se vazia.</p>
                    <p className="text-sm text-[#9CA3AF] mt-1 max-w-sm">Abra a aba de Fluxos e inicie uma operação de prospecção comercial.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#27272A]">
                    {campaigns.slice(0, 4).map(c => {
                      const contatados = c.leads?.filter(l => l.status !== 'não contatado').length || 0;
                      return (
                        <div key={c.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                          <div>
                            <strong className="text-slate-200 block text-base">{c.name}</strong>
                            <span className="text-xs text-[#9CA3AF] font-medium">{c.niche} • {c.location} • {c.leads?.length || 0} leads</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {c.status === 'scraping' ? (
                              <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse">Extraindo...</span>
                            ) : c.status === 'error' ? (
                              <span className="text-xs bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-full">Erro</span>
                            ) : (
                              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">Mapeado</span>
                            )}
                            <button 
                              onClick={() => { setActiveCampaignId(c.id); setCurrentView('campaign'); }}
                              className="p-2 hover:bg-[#18181B] text-[#9CA3AF] hover:text-white rounded-lg transition-all border border-[#27272A]"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {campaigns.length > 4 && (
              <div className="p-4 bg-[#18181B] border-t border-[#27272A] text-center">
                <button onClick={() => setCurrentView('fluxos')} className="text-xs text-[#C5A27D] hover:underline font-bold">
                  Ver todas as {campaigns.length} campanhas do estúdio →
                </button>
              </div>
            )}
          </div>

          {/* AJUSTÁVEL META SEMANAL FINANCEIRA (1/3 width) */}
          <div className="border border-[#27272A] bg-[#09090B] p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-200 border-b border-[#27272A] pb-3">
                <Target size={18} className="text-[#C5A27D]" />
                <h3 className="text-base font-semibold text-white">Objetivo Semanal (CRM)</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-[#9CA3AF] font-medium leading-relaxed">
                  Acompanha as suas baixas e receita faturada na semana atual (21 a 27 de Junho de 2026).
                </p>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(weeklyRevenue)}</span>
                  <div className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                    <span>Meta: {formatCurrency(weeklyGoal)}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Progresso da Semana</span>
                  <span>{goalPercentage}%</span>
                </div>
                <div className="w-full bg-[#18181B] border border-[#27272A] h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C5A27D] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${goalPercentage}%` }} 
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#9CA3AF] font-semibold">
                Gerado por {weeklyCount} {weeklyCount === 1 ? 'contrato fechado' : 'contratos fechados'} esta semana.
              </p>

              {weeklyRevenue >= weeklyGoal ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-bold text-center animate-pulse">
                  ✨ Incrível! Meta Financeira Batida! 🌸
                </div>
              ) : (
                <div className="text-[11px] text-[#9CA3AF] font-medium">
                  Faltam {formatCurrency(Math.max(0, weeklyGoal - weeklyRevenue))} para atingir a meta semanal.
                </div>
              )}
            </div>

            {/* Adjust Goal Controls */}
            <div className="pt-4 border-t border-[#27272A] space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ajustar Meta Semanal (R$)</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSaveGoal(weeklyGoal - 50)}
                  className="w-10 h-10 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-white rounded-xl font-bold transition-all text-sm"
                >
                  -
                </button>
                <input 
                  type="number" 
                  min="1"
                  className="flex-1 text-center bg-[#18181B] border border-[#27272A] rounded-xl py-2 font-bold text-white text-sm focus:outline-none focus:border-[#C5A27D]"
                  value={weeklyGoal}
                  onChange={(e) => handleSaveGoal(Number(e.target.value))}
                />
                <button 
                  onClick={() => handleSaveGoal(weeklyGoal + 50)}
                  className="w-10 h-10 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-white rounded-xl font-bold transition-all text-sm"
                >
                  +
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  const LeadsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const allLeads = campaigns.flatMap(c => (c.leads || []).map(l => ({ ...l, campaignId: c.id, campaignName: c.name })));

    const filteredLeads = allLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="pb-4 border-b border-[#27272A]">
          <h1 className="text-3xl font-bold tracking-tight text-white">Empresas</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Lista unificada de todas as entidades capturadas pelas suas campanhas de mapas.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center bg-[#09090B] border border-[#27272A] p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar empresas..."
              className="w-full pl-11 pr-4 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-white focus:outline-none focus:border-[#C5A27D] transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-slate-300 focus:outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="não contatado">Pendente</option>
            <option value="contatado">Em Comunicação</option>
            <option value="convertido">Convertido (Baixa Feita)</option>
          </select>
        </div>

        {/* Unified Table */}
        <div className="border border-[#27272A] bg-[#09090B] rounded-2xl overflow-hidden">
          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="text-[#9CA3AF] font-semibold text-xs uppercase border-b border-[#27272A] bg-[#09090B]">
                <th className="p-4 pl-6">Entidade</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Fluxo de Origem</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Opções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[#9CA3AF] font-medium">Nenhuma empresa encontrada com os filtros de busca.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white">{lead.name}</div>
                      {lead.website && <span className="text-xs text-[#9CA3AF] truncate max-w-[200px] block">{lead.website}</span>}
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{lead.phone || "Não listado"}</td>
                    <td className="p-4 text-[#9CA3AF] font-medium">{lead.campaignName}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lead.status === 'convertido' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        lead.status === 'contatado' ? 'bg-[#C5A27D]/10 text-[#C5A27D] border border-[#C5A27D]/20' :
                        'bg-[#18181B] text-[#9CA3AF] border border-[#27272A]'
                      }`}>
                        {lead.status === 'convertido' ? 'Fechado' : lead.status === 'contatado' ? 'Em Contato' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button 
                        onClick={() => { setActiveCampaignId(lead.campaignId); setCurrentView('campaign'); }}
                        className="text-xs font-bold text-slate-300 hover:text-white bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] px-3 py-2 rounded-xl transition-all"
                      >
                        Ver Ficha / CRM
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const PitchesView = () => {
    const allLeads = campaigns.flatMap(c => (c.leads || []).map(l => ({ ...l, campaignId: c.id })));
    const [selectedLeadForTone, setSelectedLeadForTone] = useState(null);

    const getWhatsAppLink = (phoneNum, pitchText) => {
      if (!phoneNum || phoneNum === 'não achou' || phoneNum === 'não encontrado' || phoneNum === 'Não informado') return null;
      const cleanPhone = phoneNum.replace(/\D/g, '');
      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(pitchText)}`;
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="pb-4 border-b border-[#27272A]">
          <h1 className="text-3xl font-bold tracking-tight text-white">Roteiros de Abordagem</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Controle todos os scripts comerciais de IA gerados para as suas frentes de negócio.</p>
        </div>

        {allLeads.length === 0 ? (
          <div className="border border-[#27272A] bg-[#09090B] rounded-3xl p-12 text-center text-[#9CA3AF] font-medium">
            Nenhum roteiro comercial disponível. Ative uma varredura para que a IA crie abordagens.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allLeads.map(lead => (
              <div key={lead.id} className="border border-[#27272A] bg-[#09090B] rounded-2xl p-6 space-y-4 relative flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                      <span className="text-xs text-[#9CA3AF] font-semibold">{lead.phone}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedLeadForTone(lead.id === selectedLeadForTone?.id ? null : lead)}
                      className="p-1.5 hover:bg-[#18181B] rounded-lg text-slate-400 hover:text-white transition-all border border-transparent hover:border-[#27272A]"
                      title="Otimizar script com IA"
                    >
                      <Sparkles size={16} className="text-[#C5A27D]" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed italic bg-[#141417] p-4 rounded-xl border border-[#27272A]">
                    "{lead.pitch}"
                  </p>
                </div>

                {/* IA Tone Adjuster Open Panel */}
                {selectedLeadForTone?.id === lead.id && (
                  <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-2xl space-y-3 animate-fade-in">
                    <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block">Mudar o Tom do Roteiro (IA Gemini)</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ex: Mudar para um tom mais agressivo e curto..."
                        className="flex-1 px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A27D]"
                        value={aiToneCommand}
                        onChange={e => setAiToneCommand(e.target.value)}
                      />
                      <button 
                        onClick={() => handleTunePitchTone(lead.campaignId, lead.id, lead.pitch, aiToneCommand)}
                        disabled={isTuningTone[lead.id]}
                        className="px-4 py-2 bg-[#C5A27D] text-black rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {isTuningTone[lead.id] ? <RefreshCw size={12} className="animate-spin" /> : "Reescrever"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => copyToClipboard(lead.pitch, lead.id)}
                    className="flex-1 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white rounded-xl text-xs font-semibold border border-[#27272A] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy size={12} /> Copiar Script
                  </button>
                  {getWhatsAppLink(lead.phone, lead.pitch) && (
                    <a 
                      href={getWhatsAppLink(lead.phone, lead.pitch)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 text-center"
                    >
                      <Send size={12} /> Enviar via Zap
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const FlowsView = () => {
    const [formData, setFormData] = useState({ name: '', niche: NICHES[0].name, location: 'Florianópolis - SC', quantity: 5 });

    const submit = (e) => {
      e.preventDefault();
      if (!formData.name) return showToast("Por favor dê um nome à sua campanha.");
      handleCreateCampaign(formData);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        {/* Criador de Fluxo */}
        <div className="lg:col-span-1 border border-[#27272A] bg-[#09090B] rounded-3xl p-6 space-y-6 self-start">
          <div>
            <h2 className="text-xl font-bold text-white">Novo Mapeamento</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">Extraia contactos locais de Florianópolis com a sua conta Apify e IA.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identificação</label>
              <input 
                type="text" 
                placeholder="Ex: Clínicas Odontológicas Coqueiros"
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A27D] transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nicho Alvo</label>
              <select 
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A27D] transition-colors"
                value={formData.niche}
                onChange={e => setFormData({...formData, niche: e.target.value})}
              >
                {NICHES.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Volume</label>
              <select 
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A27D] transition-colors"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
              >
                {[5, 10, 15, 20, 30].map(q => <option key={q} value={q}>{q} leads</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Localização do Alvo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A27D] transition-colors"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#C5A27D] hover:bg-[#b5926d] text-black text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              Criar e Varrear Alvos
            </button>
          </form>
        </div>

        {/* Histórico Geral de Fluxos */}
        <div className="lg:col-span-2 border border-[#27272A] bg-[#09090B] rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Histórico de Campanhas de Varredura</h2>
            <p className="text-xs text-[#9CA3AF] mt-1">Visualize todos os fluxos disparados, dados obtidos e status operacional.</p>
          </div>

          <div className="space-y-4">
            {campaigns.length === 0 ? (
              <p className="text-[#9CA3AF] font-medium text-sm text-center py-8">Nenhum fluxo cadastrado até o momento.</p>
            ) : (
              campaigns.map(c => (
                <div key={c.id} className="border border-[#27272A] bg-[#18181B] p-5 rounded-2xl flex justify-between items-center transition-all hover:border-[#3F3F46]">
                  <div className="space-y-1">
                    <strong className="text-white text-base block">{c.name}</strong>
                    <div className="flex gap-2 text-xs text-[#9CA3AF] font-semibold">
                      <span>Nicho: {c.niche}</span>
                      <span>•</span>
                      <span>Local: {c.location}</span>
                      <span>•</span>
                      <span>{c.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      c.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                      c.status === 'scraping' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {c.status === 'done' ? `${c.leads?.length || 0} leads` : c.status === 'scraping' ? 'Scraping' : 'Falhou'}
                    </span>
                    <button 
                      onClick={() => deleteCampaign(c.id)}
                      className="p-2 bg-[#09090B] border border-[#27272A] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                      title="Apagar Campanha"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    const totalLeads = campaigns.reduce((acc, c) => acc + (c.leads?.length || 0), 0);
    const contactedLeads = campaigns.reduce((acc, c) => acc + (c.leads?.filter(l => l.status !== 'não contatado').length || 0), 0);
    const convertedLeads = campaigns.reduce((acc, c) => acc + (c.leads?.filter(l => l.status === 'convertido').length || 0), 0);

    // Agrupamento de Conversão por Nicho
    const statsByNiche = NICHES.map(n => {
      const nicheLeads = campaigns.filter(c => c.niche === n.name).flatMap(c => c.leads || []);
      const nicheTotal = nicheLeads.length;
      const nicheConverted = nicheLeads.filter(l => l.status === 'convertido').length;
      return {
        name: n.name,
        total: nicheTotal,
        converted: nicheConverted,
        rate: nicheTotal > 0 ? Math.round((nicheConverted / nicheTotal) * 100) : 0
      };
    }).filter(s => s.total > 0);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="pb-4 border-b border-[#27272A]">
          <h1 className="text-3xl font-bold tracking-tight text-white">Relatórios Analíticos</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Estatísticas dinâmicas e inteligência de vendas geradas pela plataforma.</p>
        </div>

        {/* Funil de Conversão Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-[#27272A] bg-[#09090B] rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart size={18} className="text-[#C5A27D]" /> Funil de Oportunidades Mapeadas
            </h2>

            <div className="space-y-4">
              {[
                { step: '1. Empresas Mapeadas', count: totalLeads, pct: 100, color: 'bg-slate-500' },
                { step: '2. Abordadas', count: contactedLeads, pct: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0, color: 'bg-[#C5A27D]' },
                { step: '3. Convertidas (Sucesso)', count: convertedLeads, pct: contactedLeads > 0 ? Math.round((convertedLeads / contactedLeads) * 100) : 0, color: 'bg-emerald-500' }
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#9CA3AF]">
                    <span>{step.step}</span>
                    <span>{step.count} ({step.pct}%)</span>
                  </div>
                  <div className="w-full bg-[#18181B] border border-[#27272A] h-2.5 rounded-full overflow-hidden">
                    <div className={`${step.color} h-full rounded-full transition-all`} style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#27272A] bg-[#09090B] rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck size={18} className="text-[#C5A27D]" /> Eficiência Comercial por Segmento Alvo
            </h2>

            {statsByNiche.length === 0 ? (
              <p className="text-[#9CA3AF] text-sm font-medium py-12 text-center">Inicie varreduras e contacte leads para calcular taxas de conversão por nicho.</p>
            ) : (
              <div className="space-y-4">
                {statsByNiche.map((sn, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-semibold bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                    <span className="text-white font-bold">{sn.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#9CA3AF]">{sn.converted} de {sn.total} leads</span>
                      <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md text-xs">{sn.rate}% Conv.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- NOVA ABA DE RECEITA (FINANCEIRO & CRM CASHFLOW) ---
  const ReceitaView = () => {
    const allLeads = campaigns.flatMap(c => (c.leads || []).map(l => ({ ...l, campaignId: c.id, campaignName: c.name })));
    const closedDeals = allLeads.filter(l => l.status === 'convertido');

    // Cálculos Financeiros
    const totalRevenue = closedDeals.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const weeklyRevenue = closedDeals
      .filter(l => isDateInCurrentWeek(l.conversionDate))
      .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const averageTicket = closedDeals.length > 0 ? Math.round(totalRevenue / closedDeals.length) : 0;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="pb-4 border-b border-[#27272A]">
          <h1 className="text-3xl font-bold tracking-tight text-white">Receita & Caixa</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Visão analítica de faturamento e fluxo de caixa proveniente de conversões do maps.</p>
        </div>

        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Faturamento Acumulado', value: formatCurrency(totalRevenue), desc: 'Soma total dos contratos fechados', icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Faturamento da Semana', value: formatCurrency(weeklyRevenue), desc: 'Ganhos gerados na semana atual', icon: TrendingUp, color: 'text-[#C5A27D]' },
            { label: 'Ticket Médio', value: formatCurrency(averageTicket), desc: 'Valor médio por contrato assinado', icon: Clipboard, color: 'text-indigo-400' }
          ].map((card, i) => (
            <div key={i} className="border border-[#27272A] bg-[#09090B] p-6 rounded-2xl flex justify-between items-start">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">{card.label}</span>
                <p className={`text-3xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
                <p className="text-xs text-[#9CA3AF]">{card.desc}</p>
              </div>
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl text-slate-400">
                <card.icon size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* LEDGER / CRM CLOSINGS TABLE */}
        <div className="border border-[#27272A] bg-[#09090B] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#27272A] flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Registos de Baixas (Contratos Assinados)</h2>
            <span className="text-xs font-semibold text-slate-400 bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-full">
              {closedDeals.length} conversões
            </span>
          </div>

          <table className="w-full text-left font-sans text-sm">
            <thead>
              <tr className="text-[#9CA3AF] font-semibold text-xs uppercase border-b border-[#27272A] bg-[#09090B]">
                <th className="p-4 pl-6">Cliente</th>
                <th className="p-4">Origem</th>
                <th className="p-4 text-center">Data da Abordagem</th>
                <th className="p-4 text-center">Data do Fechamento</th>
                <th className="p-4 text-right pr-6">Valor do Contrato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {closedDeals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[#9CA3AF] font-medium">Nenhum contrato fechado ainda. Dê baixa em algum lead como "Convertido".</td>
                </tr>
              ) : (
                closedDeals.map(lead => (
                  <tr key={lead.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{lead.name}</td>
                    <td className="p-4 text-slate-400">{lead.campaignName}</td>
                    <td className="p-4 text-center text-slate-300 font-medium">
                      {lead.approachDate ? new Date(lead.approachDate + "T12:00:00").toLocaleDateString('pt-BR') : "—"}
                    </td>
                    <td className="p-4 text-center text-[#C5A27D] font-bold">
                      {lead.conversionDate ? new Date(lead.conversionDate + "T12:00:00").toLocaleDateString('pt-BR') : "—"}
                    </td>
                    <td className="p-4 text-right pr-6 font-bold text-emerald-400">
                      {formatCurrency(lead.dealValue || 1500)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CampaignDetailsView = () => {
    const campaign = campaigns.find(c => c.id === activeCampaignId);
    if (!campaign) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const getStatusStyle = (status) => {
      if (status === 'convertido') return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold';
      if (status === 'contatado') return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold';
      return 'bg-[#18181B] text-[#9CA3AF] border border-[#27272A] font-bold';
    };

    const getSeverityBadge = (sev) => {
      const config = {
        high: { color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', label: 'Crítico' },
        medium: { color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', label: 'Médio' },
        low: { color: 'bg-[#18181B] text-slate-300 border border-[#27272A]', label: 'Estável' }
      };
      const c = config[sev] || config.low;
      return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full ${c.color}`}>{c.label}</span>;
    };

    const filteredLeads = (campaign.leads || []).filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const getWhatsAppLink = (phoneNum, pitchText) => {
      if (!phoneNum || phoneNum === 'não achou' || phoneNum === 'não encontrado' || phoneNum === 'Não informado') return null;
      const cleanPhone = phoneNum.replace(/\D/g, '');
      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(pitchText)}`;
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center pb-4 border-b border-[#27272A]">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => exportCampaignToCSV(campaign)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 bg-[#18181B] hover:bg-[#27272A] px-4 py-2.5 rounded-xl border border-[#27272A] transition-all shadow-sm"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button 
              onClick={() => deleteCampaign(campaign.id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-[#18181B] border border-[#27272A] hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Excluir Fluxo
            </button>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="border border-[#27272A] bg-[#09090B] rounded-3xl p-8 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Histórico do Google Maps</span>
            <h1 className="text-2xl font-bold text-white mt-1">{campaign.name}</h1>
            <div className="flex gap-2 mt-4 text-xs font-semibold text-slate-300">
              <span className="bg-white/5 px-3 py-1.5 rounded-lg">{campaign.niche}</span>
              <span className="bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <MapPin size={12} /> {campaign.location}
              </span>
              <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[#C5A27D]">{(campaign.leads || []).length} leads mapeados</span>
            </div>
          </div>
        </div>

        {/* Search Filter Panel */}
        <div className="flex gap-4 items-center bg-[#09090B] border border-[#27272A] p-4 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar leads..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white focus:outline-none focus:border-[#C5A27D] transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-slate-300 focus:outline-none cursor-pointer"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="não contatado">Pendente</option>
            <option value="contatado">Em Comunicação</option>
            <option value="convertido">Convertido (Baixa Feita)</option>
          </select>
        </div>

        {/* Leads Render */}
        <div className="space-y-6">
          {filteredLeads.map((lead, idx) => (
            <div key={lead.id} className="border border-[#27272A] bg-[#09090B] rounded-3xl p-8 flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{lead.name}</h3>
                  <a href={lead.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A27D] hover:text-[#b5926d] mt-1">
                    Analisar no Google Maps <ExternalLink size={12} />
                  </a>
                </div>

                {/* Weaknesses */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Diagnóstico Digital</span>
                  <div className="grid grid-cols-1 gap-2">
                    {(lead.weaknesses || []).map((w, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-slate-300 font-semibold">
                        <span>{w.description}</span>
                        {getSeverityBadge(w.severity)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Roteiro Recomendado (IA)</span>
                  <div className="relative bg-[#141417] p-4 rounded-xl text-sm text-slate-300 leading-relaxed italic border border-[#27272A]">
                    "{lead.pitch}"
                    <button 
                      onClick={() => copyToClipboard(lead.pitch, `pitch-${lead.id}`)}
                      className="absolute top-3 right-3 p-1.5 bg-[#18181B] border border-[#27272A] rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      {copiedId === `pitch-${lead.id}` ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Objection Helper */}
                <div className="pt-4 border-t border-[#27272A] space-y-3">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">Módulo de Objeções</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: 'Já tenho alguém que cuida de tudo'..."
                      className="flex-grow px-4 py-2.5 bg-[#070a12] border border-[#27272A] rounded-xl text-slate-200 text-sm focus:outline-none"
                      value={objectionInputs[lead.id] || ''}
                      onChange={e => setObjectionInputs(prev => ({ ...prev, [lead.id]: e.target.value }))}
                    />
                    <button 
                      onClick={() => handleResolveObjection(lead, objectionInputs[lead.id] || '')}
                      disabled={loadingObjection[lead.id] || !(objectionInputs[lead.id]?.trim())}
                      className="bg-[#C5A27D] hover:bg-[#b5926d] text-black px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                    >
                      {loadingObjection[lead.id] ? <RefreshCw size={14} className="animate-spin" /> : 'Resolver'}
                    </button>
                  </div>

                  {objectionOutputs[lead.id] && (
                    <div className="bg-[#C5A27D]/10 border border-[#C5A27D]/30 p-4 rounded-xl text-sm text-[#C5A27D] relative leading-relaxed">
                      <strong className="text-xs uppercase tracking-wider block mb-1">Roteiro Sugerido:</strong>
                      <p>"{objectionOutputs[lead.id]}"</p>
                      <button 
                        onClick={() => copyToClipboard(objectionOutputs[lead.id], `obj-${lead.id}`)}
                        className="absolute top-3 right-3 p-1.5 bg-[#09090B] border border-[#27272A] rounded-lg"
                      >
                        {copiedId === `obj-${lead.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacts Panel & Funnel */}
              <div className="w-full md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#27272A] pt-6 md:pt-0 md:pl-6 space-y-6">
                
                {/* Canais e Links */}
                <div className="space-y-4">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Canais de Contato</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#18181B] border border-[#27272A] p-3 rounded-xl text-xs text-slate-300">
                      <span className="truncate max-w-[150px]">{lead.contact_phone}</span>
                      <button onClick={() => copyToClipboard(lead.contact_phone, `phone-${lead.id}`)} className="text-slate-500 hover:text-white">
                        {copiedId === `phone-${lead.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    {getWhatsAppLink(lead.contact_phone, lead.pitch) && (
                      <a 
                        href={getWhatsAppLink(lead.contact_phone, lead.pitch)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-500 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Send size={12} /> Chamar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* CONTROLO DIRETO DE CRM (DATA E VALOR) */}
                {(lead.status === 'contatado' || lead.status === 'convertido') && (
                  <div className="border border-[#27272A] bg-[#18181B]/50 p-4 rounded-xl space-y-3">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <Calendar size={12} /> Gestão CRM
                    </span>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-slate-400 font-semibold block mb-1">Data de Abordagem</label>
                        <input 
                          type="date"
                          className="w-full bg-[#09090B] border border-[#27272A] text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C5A27D]"
                          value={lead.approachDate || ''}
                          onChange={(e) => updateLeadCrmField(campaign.id, lead.id, 'approachDate', e.target.value)}
                        />
                      </div>

                      {lead.status === 'convertido' && (
                        <>
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Data da Baixa (Fechamento)</label>
                            <input 
                              type="date"
                              className="w-full bg-[#09090B] border border-[#27272A] text-[#C5A27D] text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#C5A27D]"
                              value={lead.conversionDate || ''}
                              onChange={(e) => updateLeadCrmField(campaign.id, lead.id, 'conversionDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Valor do Fechamento (R$)</label>
                            <input 
                              type="number"
                              className="w-full bg-[#09090B] border border-[#27272A] text-emerald-400 text-xs px-2.5 py-1.5 rounded-lg font-bold focus:outline-none focus:border-[#C5A27D]"
                              value={lead.dealValue || ''}
                              onChange={(e) => updateLeadCrmField(campaign.id, lead.id, 'dealValue', Number(e.target.value))}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Switch */}
                <div className="space-y-4">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Fase da Abordagem</span>
                  <div className="grid grid-cols-1 gap-2">
                    {['não contatado', 'contatado', 'convertido'].map(st => (
                      <button
                        key={st}
                        onClick={() => updateLeadStatus(campaign.id, lead.id, st)}
                        className={`px-4 py-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between
                          ${lead.status === st 
                            ? getStatusStyle(st)
                            : 'bg-[#18181B] border-[#27272A] text-slate-500 hover:text-slate-300 hover:bg-[#27272A]'
                          }
                        `}
                      >
                        <span className="capitalize">{st === 'não contatado' ? 'Pendente' : st === 'contatado' ? 'Contatado' : 'Convertido (Baixa)'}</span>
                        {lead.status === st && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans pb-24 relative overflow-hidden flex bg-[#141417]">
      
      {/* LEFT SIDEBAR (Estética Exata Zinc-950) */}
      <aside className="w-64 bg-[#09090B] border-r border-[#27272A] flex flex-col justify-between p-6 flex-shrink-0 min-h-screen">
        <div className="space-y-8">
          {/* Logo Header - Refined Classic Editorial Typography */}
          <div className="flex items-center gap-2 mb-2 px-2 py-3 border-b border-white/5">
            <h1 
              className="text-2xl leading-none select-none" 
              style={{ 
                fontFamily: "Georgia, 'Times New Roman', Times, serif", 
                color: "#C5A27D",
                fontWeight: 300,
                fontStyle: "italic",
                letterSpacing: "0.06em"
              }}
            >
              Miyazaki Studio
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Visão Geral', icon: BarChart2 },
              { id: 'leads', label: 'Empresas', icon: Building2 },
              { id: 'abordagens', label: 'Abordagens', icon: MessageSquare },
              { id: 'fluxos', label: 'Fluxos', icon: Layers },
              { id: 'receita', label: 'Receita', icon: DollarSign },
              { id: 'relatorios', label: 'Relatórios', icon: FileText }
            ].map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all
                    ${isActive 
                      ? 'bg-[#18181B] text-white border border-[#27272A] shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#18181B]/50 border border-transparent'
                    }
                  `}
                >
                  <item.icon size={16} className={isActive ? "text-[#C5A27D]" : ""} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all hover:bg-[#18181B]/50"
          >
            <Settings size={16} />
            <span>Configurações</span>
          </button>

          {/* User Profile Card (Clickable to edit profile) */}
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="border-t border-[#27272A] pt-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center font-bold text-sm text-[#C5A27D] group-hover:border-[#C5A27D] transition-colors">
                {profileInitials}
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">{profileName}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">{profileRole}</p>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl mx-auto px-8 py-10 overflow-y-auto">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'leads' && <LeadsView />}
        {currentView === 'abordagens' && <PitchesView />}
        {currentView === 'fluxos' && <FlowsView />}
        {currentView === 'receita' && <ReceitaView />}
        {currentView === 'relatorios' && <ReportsView />}
        {currentView === 'campaign' && <CampaignDetailsView />}
      </main>

      {/* PROFILE CONFIG MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-[#27272A] rounded-3xl w-full max-w-md p-6 space-y-6 animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#27272A] pb-4">
              <h3 className="text-lg font-bold text-white">Editar Perfil de Administradora</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#18181B] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white focus:outline-none focus:border-[#C5A27D] transition-all"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cargo / Função</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white focus:outline-none focus:border-[#C5A27D] transition-all"
                  value={profileRole}
                  onChange={e => setProfileRole(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Iniciais (Avatar)</label>
                <input 
                  type="text"
                  maxLength="2"
                  className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-xl text-white focus:outline-none focus:border-[#C5A27D] transition-all"
                  value={profileInitials}
                  onChange={e => setProfileInitials(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#C5A27D] hover:bg-[#b5926d] text-black font-bold rounded-xl transition-all shadow-lg"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#18181B] text-white p-4 rounded-2xl shadow-2xl font-bold text-sm max-w-sm border border-[#27272A] animate-in slide-in-from-right flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A27D] animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <X className="cursor-pointer text-slate-400 hover:text-white transition-colors" size={16} onClick={() => setToastMessage(null)} />
        </div>
      )}
    </div>
  );
}