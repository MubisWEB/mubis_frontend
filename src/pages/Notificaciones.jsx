import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Gavel, Car, ClipboardCheck, UserCheck, CheckCheck, Inbox } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getCurrentUser, getNotificationsByUserId, markNotificationRead, markAllNotificationsRead } from '@/lib/mockStore';

const TYPE_ICONS = {
  auction_published: Car,
  new_bid: Gavel,
  bid_surpassed: Gavel,
  inspection_taken: ClipboardCheck,
  inspection_completed: ClipboardCheck,
  user_approved: UserCheck,
};

const TYPE_COLORS = {
  auction_published: 'text-primary',
  new_bid: 'text-secondary',
  bid_surpassed: 'text-destructive',
  inspection_taken: 'text-secondary',
  inspection_completed: 'text-primary',
  user_approved: 'text-primary',
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

export default function Notificaciones() {
  const user = getCurrentUser();
  const [notifications, setNotifications] = useState([]);

  const reload = () => {
    if (user) setNotifications(getNotificationsByUserId(user.id));
  };

  useEffect(() => { reload(); }, []);

  const handleMarkRead = (id) => {
    markNotificationRead(id);
    reload();
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllNotificationsRead(user.id);
      reload();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Notificaciones" subtitle={unreadCount > 0 ? `${unreadCount} sin leer` : 'Al día'} backTo="/Cuenta" />

      <div className="px-4 py-4">
        {unreadCount > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" className="text-xs text-secondary" onClick={handleMarkAllRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1" />Marcar todo como leído
            </Button>
          </motion.div>
        )}

        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold">No tienes notificaciones</p>
            <p className="text-muted-foreground text-sm mt-1">Cuando haya actividad, aparecerá aquí</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n, i) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                const color = TYPE_COLORS[n.type] || 'text-muted-foreground';
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card
                      className={`p-3.5 border shadow-sm rounded-xl cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? 'border-secondary/30 bg-secondary/5' : 'border-border'}`}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-secondary/10' : 'bg-muted'}`}>
                          <Icon className={`w-4 h-4 ${!n.read ? color : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                            {!n.read && <Badge className="bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0">Nuevo</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
