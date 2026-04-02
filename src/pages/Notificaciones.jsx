import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Bell, Gavel, Car, ClipboardCheck, UserCheck, UserX, Users, CheckCheck, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import Skeleton from 'react-loading-skeleton';

const NotifRowSkeleton = () => (
  <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
    <Skeleton circle width={36} height={36} />
    <div style={{ flex: 1 }}>
      <Skeleton width="65%" height={14} />
      <Skeleton width="40%" height={11} style={{ marginTop: 5 }} />
    </div>
  </div>
);

const TYPE_ICONS = {
  auction_published: Car,
  new_bid: Gavel,
  bid_surpassed: Gavel,
  bid_placed: Gavel,
  outbid: Gavel,
  auction_won: Gavel,
  auction_ended: Gavel,
  pending_decision: Gavel,
  pronto_pago: Gavel,
  inspection_taken: ClipboardCheck,
  inspection_completed: ClipboardCheck,
  inspection_rejected: ClipboardCheck,
  user_approved: UserCheck,
  partner_invitation: Users,
  partner_accepted: UserCheck,
  partner_rejected: UserX,
};

function getNotificationRoute(n) {
  if (n.auctionId) {
    // Seller types go to seller detail
    const sellerTypes = ['new_bid', 'pending_decision', 'auction_ended', 'auction_published'];
    if (sellerTypes.includes(n.type)) {
      return `/DetalleSubastaVendedor/${n.auctionId}`;
    }
    return `/DetalleSubasta/${n.auctionId}`;
  }
  if (n.vehicleId) {
    return `/PeritajeDetalle/${n.vehicleId}`;
  }
  if (['partner_invitation', 'partner_accepted', 'partner_rejected'].includes(n.type)) {
    return '/Partners';
  }
  return null;
}

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

export default function Notificaciones() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      const notifs = data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await notificationsApi.markRead(n.id);
        await loadNotifications();
      } catch { /* ignore */ }
    }
    const route = getNotificationRoute(n);
    if (route) navigate(route);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/Cuenta')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground font-sans">Notificaciones</h1>
        </div>
        {unreadCount > 0 && (
          <div className="flex justify-end mb-3">
            <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-secondary hover:underline">
              <CheckCheck className="w-3 h-3" />Marcar todas como leídas
            </button>
          </div>
        )}

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
          {loading ? (
            <div>{[1,2,3,4,5].map(i => <NotifRowSkeleton key={i} />)}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
          ) : (notifications.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              const hasRoute = !!getNotificationRoute(n);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-center gap-3 p-3.5 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? 'bg-secondary/5' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-secondary/10' : 'bg-muted'}`}>
                    <Icon className={`w-4 h-4 ${!n.read ? 'text-secondary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground/70 truncate">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
                </motion.div>
              );
            }))}

        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
