import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageCircle, Send, AlertTriangle, CheckCircle, Clock, User, Building2, Shield } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupportCasesByUserId, getSupportCaseById, addMessageToCase, getCurrentUser } from '@/lib/mockStore';

const STATUS_MAP = {
  OPEN: { label: 'Abierto', color: 'bg-secondary/10 text-secondary' },
  IN_REVIEW: { label: 'En revisión', color: 'bg-primary/10 text-primary' },
  RESOLVED: { label: 'Resuelto', color: 'bg-primary/10 text-primary' },
};

const ROLE_ICON = {
  comprador: User,
  vendedor: Building2,
  mediador: Shield,
};

const ROLE_COLOR = {
  comprador: 'bg-secondary/10 text-secondary',
  vendedor: 'bg-primary/10 text-primary',
  mediador: 'bg-accent text-accent-foreground',
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

// ── Cases List ──
export default function SoporteCasos() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [cases, setCases] = useState([]);

  useEffect(() => {
    if (user?.id) setCases(getSupportCasesByUserId(user.id));
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Mubis Soporte</h1>
            <p className="text-xs text-muted-foreground">Casos</p>
          </div>
        </div>
        {cases.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Sin casos abiertos</h3>
            <p className="text-sm text-muted-foreground">Cuando reportes un problema con un<br />vehículo ganado, aparecerá aquí.</p>
          </motion.div>
        ) : (
          cases.map((c, i) => {
            const status = STATUS_MAP[c.status] || STATUS_MAP.OPEN;
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card
                  className="p-4 border border-border shadow-sm rounded-xl cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => navigate(`/SoporteCasos/${c.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">{c.vehicleLabel}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(c.createdAt)}</p>
                    </div>
                    <Badge className={`${status.color} text-[10px] border-0 ml-2`}>{status.label}</Badge>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="w-3 h-3" /> {c.buyerName}
                    </div>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Building2 className="w-3 h-3" /> {c.sellerName}
                    </div>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Shield className="w-3 h-3" /> Mubis
                    </div>
                  </div>

                  {lastMsg && (
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="font-medium text-foreground">{lastMsg.senderName}:</span> {lastMsg.text}
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ── Case Detail / Chat ──
export function SoporteCasoDetalle() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [caseData, setCaseData] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (caseId) setCaseData(getSupportCaseById(caseId));
  }, [caseId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [caseData?.messages?.length]);

  const handleSend = () => {
    if (!newMsg.trim() || !user) return;
    addMessageToCase(caseId, {
      senderId: user.id,
      senderRole: 'comprador',
      senderName: user.nombre || 'Comprador',
      text: newMsg.trim(),
    });
    setNewMsg('');
    setCaseData(getSupportCaseById(caseId));

    // Simulate Mubis auto-response after 1s
    setTimeout(() => {
      addMessageToCase(caseId, {
        senderId: 'mubis',
        senderRole: 'mediador',
        senderName: 'Mubis Soporte',
        text: 'Gracias por tu mensaje. Estamos analizando tu caso y nos comunicaremos con el vendedor. Te mantendremos informado.',
      });
      setCaseData(getSupportCaseById(caseId));
    }, 1200);
  };

  if (!caseData) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Caso no encontrado</p>
    </div>
  );

  const status = STATUS_MAP[caseData.status] || STATUS_MAP.OPEN;

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col">
      <Header />

      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/SoporteCasos')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground font-sans">{caseData.vehicleLabel}</h1>
          <p className="text-xs text-muted-foreground">Caso de soporte</p>
        </div>
      </div>

      {/* Case info bar */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${status.color} text-xs border-0`}>{status.label}</Badge>
          <span className="text-[10px] text-muted-foreground">{timeAgo(caseData.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
              <User className="w-3 h-3 text-secondary" />
            </div>
            <span>{caseData.buyerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-3 h-3 text-primary" />
            </div>
            <span>{caseData.sellerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Shield className="w-3 h-3 text-accent-foreground" />
            </div>
            <span>Mubis</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {caseData.messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const RoleIcon = ROLE_ICON[msg.senderRole] || User;
          const roleColor = ROLE_COLOR[msg.senderRole] || 'bg-muted text-muted-foreground';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${roleColor}`}>
                <RoleIcon className="w-4 h-4" />
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-foreground">{msg.senderName}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                </div>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                  isMe
                    ? 'bg-secondary text-secondary-foreground rounded-tr-md'
                    : msg.senderRole === 'mediador'
                      ? 'bg-accent/50 text-foreground border border-border rounded-tl-md'
                      : 'bg-muted text-foreground rounded-tl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-3 bg-background border-t border-border pt-3 z-40">
        <div className="flex gap-2">
          <Input
            placeholder="Escribe un mensaje..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 h-11 rounded-full border-border bg-muted/50 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!newMsg.trim()}
            className="h-11 w-11 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
