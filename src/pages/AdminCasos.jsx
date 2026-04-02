import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, User, Building2, Shield, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { casesApi, companiesApi, branchesApi } from '@/api/services';
import { toast } from 'sonner';

const STATUS_MAP = {
  OPEN: { label: 'Abierto', color: 'bg-secondary/10 text-secondary', icon: AlertTriangle },
  IN_REVIEW: { label: 'En revisión', color: 'bg-primary/10 text-primary', icon: Clock },
  RESOLVED: { label: 'Resuelto', color: 'bg-primary/10 text-primary', icon: CheckCircle },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

export default function AdminCasos() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    casesApi.getAll().then(setCases).catch(() => {});
    companiesApi.getAll().catch(() => []).then(list => setCompanies(list || []));
    branchesApi.getAll().catch(() => []).then(list => setBranches(list || []));
  }, []);

  const filteredBranches = filterCompany
    ? branches.filter(b => b.companyId === filterCompany || b.company === filterCompany)
    : branches;

  const filtered = cases.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCompany && c.companyId !== filterCompany) return false;
    if (filterBranch && c.branchId !== filterBranch) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.vehicleLabel || '').toLowerCase().includes(q) ||
             (c.buyerName || '').toLowerCase().includes(q) ||
             (c.sellerName || '').toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: cases.length,
    OPEN: cases.filter(c => c.status === 'OPEN').length,
    IN_REVIEW: cases.filter(c => c.status === 'IN_REVIEW').length,
    RESOLVED: cases.filter(c => c.status === 'RESOLVED').length,
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Casos de Soporte" subtitle={`${cases.length} casos`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'OPEN', label: 'Abiertos', count: counts.OPEN, colorClass: 'text-secondary', activeBg: 'bg-secondary/15 border-secondary' },
            { key: 'IN_REVIEW', label: 'En revisión', count: counts.IN_REVIEW, colorClass: 'text-primary', activeBg: 'bg-primary/15 border-primary' },
            { key: 'RESOLVED', label: 'Resueltos', count: counts.RESOLVED, colorClass: 'text-primary', activeBg: 'bg-primary/15 border-primary' },
          ].map(stat => (
            <button key={stat.key} onClick={() => setFilterStatus(filterStatus === stat.key ? 'all' : stat.key)}
              className={`text-center p-3 rounded-xl border transition-all ${filterStatus === stat.key ? stat.activeBg : 'border-border bg-card hover:bg-muted/30'}`}>
              <p className={`text-2xl font-bold ${stat.colorClass}`}>{stat.count}</p>
              <p className={`text-[10px] ${filterStatus === stat.key ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Filtros empresa / sucursal */}
        {(companies.length > 0 || branches.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {companies.length > 0 && (
              <Select value={filterCompany || 'all'} onValueChange={(v) => { setFilterCompany(v === 'all' ? '' : v); setFilterBranch(''); }}>
                <SelectTrigger className="rounded-xl h-10 flex-1">
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {filteredBranches.length > 0 && (
              <Select value={filterBranch || 'all'} onValueChange={(v) => setFilterBranch(v === 'all' ? '' : v)}>
                <SelectTrigger className="rounded-xl h-10 flex-1">
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {filteredBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por vehículo, comprador o vendedor..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground text-sm" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay casos {filterStatus !== 'all' ? 'con este estado' : 'registrados'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c, i) => {
              const status = STATUS_MAP[c.status] || STATUS_MAP.OPEN;
              const lastMsg = c.messages?.[c.messages.length - 1];
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="p-4 border border-border shadow-sm cursor-pointer hover:bg-card/80 transition-colors" onClick={() => navigate(`/AdminCasos/${c.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate">{c.vehicleLabel}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</p>
                      </div>
                      <Badge className={`${status.color} text-[10px] border-0 ml-2`}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mb-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.buyerName}</span>
                      <span>↔</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.sellerName}</span>
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="font-medium text-foreground">{lastMsg.senderName}:</span> {lastMsg.text}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">{(c.messages?.length || 0)} mensaje{(c.messages?.length || 0) !== 1 ? 's' : ''}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

// ── Admin Case Detail ──
export function AdminCasoDetalle() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef(null);

  const loadCase = async () => {
    try {
      const data = await casesApi.getById(caseId);
      setCaseData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading case:', err);
      setError('No se pudo cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (caseId) loadCase(); }, [caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [caseData?.messages?.length]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      await casesApi.sendMessage(caseId, newMsg.trim());
      setNewMsg('');
      loadCase();
    } catch { toast.error('Error al enviar mensaje'); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await casesApi.update(caseId, { status: newStatus });
      setCaseData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Estado actualizado a: ${STATUS_MAP[newStatus]?.label || newStatus}`);
    } catch { toast.error('Error al actualizar estado'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-muted flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
    </div>
  );

  if (error || !caseData) return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Caso de soporte" backTo="/AdminCasos" />
      <div className="max-w-7xl mx-auto px-4 pt-8 text-center">
        <p className="text-muted-foreground mb-4">{error || 'Caso no encontrado'}</p>
        <Button onClick={() => { setLoading(true); loadCase(); }} variant="outline" className="rounded-full">
          Reintentar
        </Button>
      </div>
      <BottomNav />
    </div>
  );

  const status = STATUS_MAP[caseData.status] || STATUS_MAP.OPEN;
  const ROLE_COLOR = {
    comprador: 'bg-secondary/10 text-secondary',
    vendedor: 'bg-primary/10 text-primary',
    mediador: 'bg-accent text-accent-foreground',
  };
  const ROLE_ICON = { comprador: User, vendedor: Building2, mediador: Shield };

  return (
    <div className="min-h-screen bg-muted pb-32 flex flex-col">
      <Header title={caseData.vehicleLabel} subtitle="Gestión de caso" backTo="/AdminCasos" />

      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${status.color} text-xs border-0`}>{status.label}</Badge>
          <Select value={caseData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Abierto</SelectItem>
              <SelectItem value="IN_REVIEW">En revisión</SelectItem>
              <SelectItem value="RESOLVED">Resuelto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center"><User className="w-3 h-3 text-secondary" /></div>
            <span>{caseData.buyerName}</span>
          </div>
          <span className="text-muted-foreground text-xs">↔</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="w-3 h-3 text-primary" /></div>
            <span>{caseData.sellerName}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {(caseData.messages || []).map((msg) => {
          const isMubis = msg.senderRole === 'mediador';
          const RoleIcon = ROLE_ICON[msg.senderRole] || User;
          const roleColor = ROLE_COLOR[msg.senderRole] || 'bg-muted text-muted-foreground';
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${isMubis ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${roleColor}`}>
                <RoleIcon className="w-4 h-4" />
              </div>
              <div className="max-w-[75%]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-foreground">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                </div>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${isMubis ? 'bg-accent/50 text-foreground border border-border rounded-tr-md' : msg.senderRole === 'comprador' ? 'bg-secondary/10 text-foreground rounded-tl-md' : 'bg-primary/10 text-foreground rounded-tl-md'}`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 pb-3 bg-muted border-t border-border pt-3 z-40">
        <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
          <Shield className="w-3 h-3" /> Respondiendo como Mubis Soporte
        </p>
        <div className="flex gap-2">
          <Input placeholder="Escribe una respuesta..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 h-11 rounded-full border-border bg-card text-sm" />
          <Button onClick={handleSend} disabled={!newMsg.trim()} className="h-11 w-11 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground p-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
