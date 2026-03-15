import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Clock, HelpCircle, Send, Inbox, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { ticketsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const FAQ_SECTIONS = [
  {
    title: 'Subastas',
    items: [
      { q: '¿Cómo funciona una subasta en Mubis?', a: 'Cuando un vehículo pasa el peritaje, se publica automáticamente en subasta por 1 hora. Los recompradores y dealers pueden pujar durante ese tiempo. Al finalizar, el postor con la puja más alta gana la subasta.' },
      { q: '¿Cuál es el incremento mínimo de puja?', a: 'El incremento mínimo es de $100.000 COP sobre la puja actual. No se permiten pujas menores a ese incremento.' },
      { q: '¿Qué información veo antes de pujar?', a: 'Antes de pujar puedes ver las fotos del vehículo, marca, modelo, año, kilometraje, documentación (SOAT, Tecnomecánica, Multas), el score del peritaje con detalle por categoría, y el historial de pujas en tiempo real.' },
    ],
  },
  {
    title: 'Venta (Dealer)',
    items: [
      { q: '¿Cuándo se publica mi vehículo?', a: 'Tu vehículo se publica en subasta automáticamente cuando un perito de tu misma sucursal completa el peritaje y lo aprueba con score satisfactorio.' },
      { q: '¿Por qué requiere peritaje?', a: 'El peritaje garantiza transparencia para los compradores. Evalúa motor, transmisión, suspensión, frenos, carrocería, interior, sistema eléctrico y llantas, generando un score confiable de 0 a 100.' },
    ],
  },
  {
    title: 'Peritajes',
    items: [
      { q: '¿Cómo se asigna un peritaje por sucursal?', a: 'Los peritos solo ven vehículos pendientes de la misma sucursal donde están registrados. Pueden tomar un peritaje disponible y completar la evaluación en las 8 categorías establecidas.' },
    ],
  },
  {
    title: 'Documentación',
    items: [
      { q: '¿Por qué se piden SOAT, Tecnomecánica y Multas?', a: 'Son documentos legales obligatorios en Colombia para la compraventa de vehículos. Mubis los muestra para que el comprador conozca el estado legal completo del vehículo antes de pujar.' },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { q: '¿Cómo actualizo mi nombre o teléfono?', a: 'Ve a Cuenta > Mi perfil. Allí puedes editar tu nombre y número de teléfono. Los cambios se guardan inmediatamente. La empresa y sucursal no son editables desde la app.' },
    ],
  },
];

const CASE_TYPES = [
  { value: 'subasta', label: 'Subasta' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'documentacion', label: 'Documentación' },
  { value: 'cuenta', label: 'Cuenta' },
  { value: 'otro', label: 'Otro' },
];

const STATUS_CONFIG = {
  OPEN: { label: 'Abierto', class: 'bg-secondary/10 text-secondary', icon: Inbox },
  IN_REVIEW: { label: 'En revisión', class: 'bg-primary/10 text-primary', icon: Clock },
  RESOLVED: { label: 'Resuelto', class: 'bg-muted text-muted-foreground', icon: CheckCircle },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export default function AyudaSoporte() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [caseType, setCaseType] = useState('');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await ticketsApi.getMine();
      setTickets(data || []);
    } catch { /* ignore */ } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user) loadTickets();
  }, [user]);

  const handleSubmit = async () => {
    if (!caseType) { toast.error('Selecciona un tipo de caso'); return; }
    if (!description.trim()) { toast.error('Describe tu solicitud'); return; }

    try {
      await ticketsApi.create({
        type: caseType,
        message: description.trim(),
      });
      toast.success('Solicitud enviada');
      setCaseType('');
      setDescription('');
      await loadTickets();
    } catch (err) {
      toast.error('Error al enviar la solicitud');
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await ticketsApi.update(ticketId, { status: 'RESOLVED' });
      await loadTickets();
      toast.success('Solicitud cerrada');
    } catch (err) {
      toast.error('Error al cerrar la solicitud');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/Cuenta')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Ayuda y soporte</h1>
            <p className="text-xs text-muted-foreground">Preguntas frecuentes y contacto</p>
          </div>
        </div>
        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Preguntas frecuentes</p>
          <Card className="border border-border shadow-sm rounded-xl px-4">
            {FAQ_SECTIONS.map((section, si) => (
              <div key={si}>
                {si > 0 && <div className="border-t border-border" />}
                <p className="text-xs font-semibold text-secondary pt-3 pb-1">{section.title}</p>
                <Accordion type="single" collapsible>
                  {section.items.map((item, ii) => (
                    <AccordionItem key={ii} value={`${si}-${ii}`} className="border-b-0">
                      <AccordionTrigger className="text-sm text-foreground py-3 hover:no-underline">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-3">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </Card>
        </motion.div>

        {/* Contact form */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Contactar soporte</p>
          <Card className="border border-border shadow-sm rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input value={user?.nombre || ''} disabled className="text-sm opacity-70" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ''} disabled className="text-sm opacity-70" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de caso</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map(ct => (<SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe tu problema o consulta..." rows={4} className="text-sm" />
            </div>
            <Button className="w-full h-10 rounded-full font-medium" onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />Enviar solicitud
            </Button>
          </Card>
        </motion.div>

        {/* Mis solicitudes */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Mis solicitudes</p>
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            {loadingTickets ? (
              [0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <Skeleton circle width={40} height={40} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="65%" height={14} />
                    <Skeleton width="40%" height={11} style={{ marginTop: 5 }} />
                  </div>
                  <Skeleton width={50} height={14} />
                </div>
              ))
            ) : tickets.length === 0 ? (
              <div className="p-6 text-center">
                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aún no has enviado solicitudes</p>
              </div>
            ) : (
              tickets.map((t, i) => {
                const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.OPEN;
                const typeLabel = CASE_TYPES.find(ct => ct.value === t.type)?.label || t.type;
                return (
                  <div key={t.id} className={`p-3.5 border-b border-border last:border-0 ${i === 0 ? '' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] border-border">{typeLabel}</Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 ${status.class}`}>{status.label}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">{timeAgo(t.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 mt-1">{t.message?.substring(0, 120)}{t.message?.length > 120 ? '…' : ''}</p>
                    {t.status !== 'RESOLVED' && (
                      <button onClick={() => handleCloseTicket(t.id)} className="text-[11px] text-secondary hover:underline mt-1.5 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />Cerrar solicitud
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </motion.div>

        {/* Support info */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border border-border shadow-sm rounded-xl p-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">soporte@mubis.co</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Lunes a Viernes, 8:00 am – 6:00 pm</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Mubis v1.0.0</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
