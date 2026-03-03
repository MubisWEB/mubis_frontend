import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Trophy, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VehicleCard({ vehicle, onBid, onToggleFavorite, isFavorite = false, index = 0 }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

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

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';
  const detailUrl = `/DetalleSubasta/${vehicle.id}`;

  return (
    <div>
      <Card className={`overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md ${vehicle.isLeading ? 'ring-2 ring-primary' : ''}`}>
        <div className="flex p-3 gap-3">
          <Link to={detailUrl} className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
            <img src={vehicle.photos?.[0] || defaultImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
            {vehicle.isLeading && (
              <Badge className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                <Trophy className="w-2.5 h-2.5 mr-0.5" />LIDER
              </Badge>
            )}
          </Link>
          <Link to={detailUrl} className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight truncate">{vehicle.brand} {vehicle.model}</h3>
              <p className="text-muted-foreground text-xs">{vehicle.year} · {vehicle.mileage?.toLocaleString('es-CO')} km</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`font-bold text-lg ${vehicle.isLeading ? 'text-primary' : 'text-secondary'} w-[75px]`}>{formatPrice(vehicle.current_bid || 0)}</span>
              <span className="text-muted-foreground text-xs flex items-center w-[36px]"><Users className="w-3 h-3 mr-0.5 flex-shrink-0" />{vehicle.bids_count || 0}</span>
            </div>
          </Link>
          <div className="flex flex-col items-end justify-between">
            <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-1 rounded-full ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              <Clock className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="font-medium tabular-nums">{timeLeft}</span>
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
