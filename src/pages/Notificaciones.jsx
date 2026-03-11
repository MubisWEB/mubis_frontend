import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Bell, Gavel, Car, ClipboardCheck, UserCheck, CheckCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getNotificationsByUserId, getUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/lib/mockStore';

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
  const user = getCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      setNotifications(getNotificationsByUserId(user.id));
      setUnreadCount(getUnreadCount(user.id));
    }
  }, []);

  const handleMarkAllRead = () => {
    if (user) {
      markAllNotificationsRead(user.id);
      setNotifications(getNotificationsByUserId(user.id));
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markNotificationRead(n.id);
      if (user) {
        setNotifications(getNotificationsByUserId(user.id));
        setUnreadCount(getUnreadCount(user.id));
      }
    }
    const route = getNotificationRoute(n);
    if (route) navigate(route);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Notificaciones" backTo="/Cuenta" />

      <div className="px-4 py-4">
        {unreadCount > 0 && (
          <div className="flex justify-end mb-3">
            <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-secondary hover:underline">
              <CheckCheck className="w-3 h-3" />Marcar todas como leídas
            </button>
          </div>
        )}

        <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No tienes notificaciones</div>
          ) : (
            notifications.map((n) => {
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
            })
          )}
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
