import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChevronRight, CalendarPlus } from 'lucide-react';

const DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
];

function getPhotos(auction, index = 0) {
  const main = auction.photos?.[0] || DEMO_PHOTOS[0];
  const extras = [];
  for (let i = 1; i <= 4; i++) {
    extras.push(DEMO_PHOTOS[(index + i) % DEMO_PHOTOS.length]);
  }
  return { main, extras };
}

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

/** Grid view card (vertical) */
export function WonAuctionGridCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend, index = 0 }) {
  const { main, extras } = getPhotos(auction, index);
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="relative flex gap-0.5 bg-muted overflow-hidden" style={{ height: '200px' }}>
        <div className="flex-1 relative overflow-hidden">
          <img src={main} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5">
            <CheckCircle className="w-3 h-3 mr-1" />Ganado
          </Badge>
        </div>
        <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-0.5">
          {extras.map((photo, i) => (
            <div key={i} className="overflow-hidden bg-muted">
              <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} />
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
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

/** Lateral/list view card (horizontal) */
export function WonAuctionListCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend, index = 0 }) {
  const { main, extras } = getPhotos(auction, index);
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      <div className="flex">
        {/* Photo gallery - lateral */}
        <div className="relative flex gap-0.5 bg-muted overflow-hidden w-[55%] md:w-[45%]" style={{ minHeight: '160px' }}>
          <div className="flex-1 relative overflow-hidden">
            <img src={main} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Ganado
            </Badge>
          </div>
          <div className="w-[38%] grid grid-cols-2 grid-rows-2 gap-0.5">
            {extras.map((photo, i) => (
              <div key={i} className="overflow-hidden bg-muted">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base leading-tight truncate">{auction.brand} {auction.model}</h3>
              <StatusBadge isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} />
            </div>
            <p className="text-muted-foreground text-xs mt-1">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-xl text-primary">{formatPrice(auction.current_bid)}</span>
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

/** Mobile compact card with gallery */
export function WonAuctionMobileCard({ auction, formatPrice, navigate, isCompleted, canExtend, remaining, onExtend, index = 0 }) {
  const { main, extras } = getPhotos(auction, index);
  return (
    <Card className="overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/DetalleSubasta/${auction.id}?from=ganados`)}>
      {/* Photo gallery top */}
      <div className="relative flex gap-0.5 bg-muted overflow-hidden" style={{ height: '140px' }}>
        <div className="flex-1 relative overflow-hidden">
          <img src={main} alt={`${auction.brand} ${auction.model}`} className="w-full h-full object-cover" />
          <Badge className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />Ganado
          </Badge>
        </div>
        <div className="w-[38%] grid grid-cols-2 grid-rows-2 gap-0.5">
          {extras.map((photo, i) => (
            <div key={i} className="overflow-hidden bg-muted">
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute top-1.5 right-1.5">
          <StatusBadge isCompleted={isCompleted} canExtend={canExtend} remaining={remaining} />
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-sm leading-tight truncate">{auction.brand} {auction.model}</h3>
            <p className="text-muted-foreground text-xs mt-0.5">{auction.year} · {Number(auction.mileage || 0).toLocaleString('es-CO')} km · {auction.city}</p>
          </div>
          {canExtend && (
            <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/5 font-semibold px-2 h-7 rounded-full text-[10px] flex-shrink-0 ml-2"
              onClick={(e) => { e.stopPropagation(); onExtend(auction); }}>
              <CalendarPlus className="w-3 h-3 mr-1" />Extensión
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-lg text-primary">{formatPrice(auction.current_bid)}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}
