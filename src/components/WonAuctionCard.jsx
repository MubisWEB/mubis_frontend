import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChevronRight, CalendarPlus } from 'lucide-react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop';

function formatCountdown(ms) {
  if (ms <= 0) return 'Completado';
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

function StatusBadge({ isCompleted, canExtend, remaining }) {
  const cls = isCompleted
    ? 'bg-primary/80 text-primary-foreground'
    : canExtend
      ? 'bg-destructive/80 text-destructive-foreground'
      : 'bg-background/80 text-foreground';
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm ${cls}`}>
      {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <span className="font-semibold">{isCompleted ? 'Completado' : formatCountdown(remaining)}</span>
    </div>
  );
}

/** Grid view card (vertical, single photo) */
export function WonAuctionGridCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend }) {
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={auction.photos?.[0] || DEFAULT_IMAGE} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">
          <CheckCircle className="w-3 h-3 mr-1" />Ganado
        </Badge>
        <div className="absolute top-2 right-2">
          <StatusBadge isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} />
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-foreground">{formatPrice(auction.current_bid)}</span>
          {canExtend ? (
            <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-3 h-8 rounded-full text-xs"
              onClick={(e) => { e.stopPropagation(); onExtend(auction); }}>
              <CalendarPlus className="w-3 h-3 mr-1" />Extensión
            </Button>
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
    </Card>
  );
}

/** Lateral/list view card (horizontal, single photo) */
export function WonAuctionListCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend }) {
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="flex">
        <div className="relative w-[40%] bg-muted overflow-hidden" style={{ minHeight: '160px' }}>
          <img src={auction.photos?.[0] || DEFAULT_IMAGE} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Ganado
          </Badge>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base leading-tight truncate">{auction.brand} {auction.model}</h3>
              <StatusBadge isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} />
            </div>
            <p className="text-muted-foreground text-xs mt-1">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-xl text-foreground">{formatPrice(auction.current_bid)}</span>
            {canExtend ? (
              <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-3 h-8 rounded-full text-xs"
                onClick={(e) => { e.stopPropagation(); onExtend(auction); }}>
                <CalendarPlus className="w-3 h-3 mr-1" />Extensión
              </Button>
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Mobile compact card (single photo) */
export function WonAuctionMobileCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend }) {
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="flex p-3 gap-3">
        <div className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
          <img src={auction.photos?.[0] || DEFAULT_IMAGE} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />
          <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Ganado
          </Badge>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight truncate">{auction.brand} {auction.model}</h3>
            <p className="text-muted-foreground text-xs">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-lg text-foreground">{formatPrice(auction.current_bid)}</span>
            <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${isCompleted ? 'bg-primary/10 text-primary' : canExtend ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
              {isCompleted ? <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" /> : <Clock className="w-2.5 h-2.5 flex-shrink-0" />}
              <span className="font-medium">{isCompleted ? 'Completado' : formatCountdown(remaining)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {canExtend && (
            <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-2 h-7 rounded-full text-[10px]"
              onClick={(e) => { e.stopPropagation(); onExtend(auction); }}>
              <CalendarPlus className="w-3 h-3 mr-1" />Extensión
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
