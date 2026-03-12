import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Trophy, Bookmark, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { watchlistApi } from '@/api/services';
import { toast } from 'sonner';

export default function VehicleCard({ vehicle, onBid, onToggleFavorite, isFavorite: isFavoriteProp, index = 0, variant = 'compact' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const { user } = useAuth();
  const saved = isFavoriteProp !== undefined ? isFavoriteProp : false;

  useEffect(() => {
    const calculateTime = () => {
      const endField = vehicle.auction_end || vehicle.ends_at;
      if (!endField) return 'Sin tiempo';
      const end = new Date(endField);
      const now = new Date();
      const diff = end - now;
      if (diff <= 0) return 'Finalizada';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setIsUrgent(hours === 0 && minutes < 30);
      if (hours > 24) { const days = Math.floor(hours / 24); return `${days}d ${hours % 24}h`; }
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m ${seconds}s`;
    };
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [vehicle.auction_end, vehicle.ends_at]);

  const formatPrice = (price) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  };

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(vehicle);
      return;
    }
    if (!user) return;
    try {
      const result = await watchlistApi.toggle(vehicle.id);
      toast.success(result.saved ? 'Agregada a guardados' : 'Eliminada de guardados');
    } catch {
      toast.error('Error al actualizar guardados');
    }
  };

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';
  const detailUrl = `/DetalleSubasta/${vehicle.id}`;

  if (variant === 'grid') {
    return (
      <Card className={`overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-shadow group ${vehicle.isLeading ? 'ring-2 ring-green-500' : ''}`}>
        <Link to={detailUrl} className="block relative aspect-[4/3] bg-muted overflow-hidden">
          <img src={vehicle.photos?.[0] || defaultImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {vehicle.isLeading && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5">
              <Trophy className="w-3 h-3 mr-1" />LÍDER
            </Badge>
          )}
          <div className={`absolute top-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm ${isUrgent ? 'bg-destructive/80 text-destructive-foreground' : 'bg-background/80 text-foreground'}`}>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="font-semibold tabular-nums">{timeLeft}</span>
          </div>
        </Link>
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link to={detailUrl} className="min-w-0">
              <h3 className="font-bold text-foreground text-sm leading-tight truncate">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{vehicle.year} · {(vehicle.mileage || vehicle.km || 0).toLocaleString('es-CO')} km</p>
            </Link>
            <button onClick={handleToggleSave} className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0">
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-bold text-lg text-foreground">{formatPrice(vehicle.current_bid || 0)}</span>
              {vehicle.myMaxBid > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Eye className="w-3 h-3 text-violet-500" />
                  <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold">Mi máx: {formatPrice(vehicle.myMaxBid)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-muted-foreground text-xs flex items-center"><Users className="w-3 h-3 mr-0.5" />{vehicle.bids_count || 0} pujas</span>
              </div>
            </div>
            <Button onClick={(e) => { e.preventDefault(); onBid?.(vehicle); }} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-4 h-9 rounded-full text-sm">
              Pujar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className={`overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md ${vehicle.isLeading ? 'ring-2 ring-green-500' : ''}`}>
        <div className="flex p-3 gap-3">
          <Link to={detailUrl} className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
            <img src={vehicle.photos?.[0] || defaultImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
            {vehicle.isLeading && (
              <Badge className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0">
                <Trophy className="w-2.5 h-2.5 mr-0.5" />LIDER
              </Badge>
            )}
          </Link>
          <Link to={detailUrl} className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight truncate">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-muted-foreground text-xs">{vehicle.year} · {(vehicle.mileage || vehicle.km || 0).toLocaleString('es-CO')} km</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-lg text-foreground w-[75px]">{formatPrice(vehicle.current_bid || 0)}</span>
              <span className="text-muted-foreground text-xs flex items-center w-[36px]"><Users className="w-3 h-3 mr-0.5 flex-shrink-0" />{vehicle.bids_count || 0}</span>
            </div>
            {vehicle.myMaxBid > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Eye className="w-2.5 h-2.5 text-violet-500" />
                <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">Mi máx: {formatPrice(vehicle.myMaxBid)}</span>
              </div>
            )}
          </Link>
          <div className="flex flex-col items-end justify-between">
            <div className="flex items-center gap-1">
              <button onClick={handleToggleSave} className="p-1 rounded-full hover:bg-muted transition-colors">
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
              </button>
              <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-1 rounded-full ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="font-medium tabular-nums">{timeLeft}</span>
              </div>
            </div>
            <Button onClick={() => onBid?.(vehicle)} size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-4 h-8 rounded-full text-sm">
              Pujar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
