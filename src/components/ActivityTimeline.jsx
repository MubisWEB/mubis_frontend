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

const COLOR_MAP = {
  bid_created: 'bg-violet-100 text-violet-700',
  auction_ended: 'bg-slate-100 text-slate-600',
  winner_set: 'bg-emerald-100 text-emerald-700',
  auction_published: 'bg-blue-100 text-blue-700',
  inspection_completed: 'bg-emerald-100 text-emerald-700',
  inspection_rejected: 'bg-red-100 text-red-600',
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
      <p className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-secondary" />Historial de actividad
      </p>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {events.map((event) => {
            const Icon = ICON_MAP[event.type] || Clock;
            const colorClass = COLOR_MAP[event.type] || 'bg-muted text-muted-foreground';
            return (
              <div key={event.id} className="flex items-start gap-3 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 flex-shrink-0 ring-2 ring-background ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pt-1.5">
                  <p className="text-sm font-medium text-foreground leading-snug">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(event.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
