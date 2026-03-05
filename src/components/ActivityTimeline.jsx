import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Gavel, FileCheck, AlertTriangle, Radio, Trophy, Car, ClipboardCheck } from 'lucide-react';

const ICON_MAP = {
  vehicle_created: Car,
  inspection_requested: ClipboardCheck,
  inspection_taken: ClipboardCheck,
  inspection_completed: FileCheck,
  inspection_rejected: AlertTriangle,
  auction_published: Radio,
  bid_created: Gavel,
  auction_ended: Clock,
  winner_set: Trophy,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

export default function ActivityTimeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <Card className="p-4 border border-border shadow-sm rounded-xl text-center">
        <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-border shadow-sm rounded-xl">
      <p className="font-bold text-foreground mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-secondary" />Historial de actividad
      </p>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-3">
          {events.map((event) => {
            const Icon = ICON_MAP[event.type] || Clock;
            return (
              <div key={event.id} className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center z-10 flex-shrink-0">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(event.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
