import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, MapPin, Trophy, Heart } from 'lucide-react';

import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VehicleCard({ vehicle, onBid, onToggleFavorite, isFavorite = false, index = 0 }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!vehicle.auction_end) return 'Sin tiempo';
      const end = new Date(vehicle.auction_end);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) return 'Finalizada';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setIsUrgent(hours === 0 && minutes < 30);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [vehicle.auction_end]);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop';
  const isHot = vehicle.isHot === true;
  const detailUrl = `${createPageUrl('DetalleSubasta')}?data=${encodeURIComponent(JSON.stringify(vehicle))}`;

  return (
    <div>
      <Card className={`overflow-hidden bg-white border-0 shadow-sm hover:shadow-md ${vehicle.isNew ? 'ring-2 ring-green-400 ring-offset-2' : ''} ${vehicle.isLeading ? 'ring-2 ring-green-500' : ''}`}>
        <div className="flex p-3 gap-3">
          {/* Imagen */}
          <Link to={detailUrl} className="w-24 h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
            <img
              src={vehicle.photos?.[0] || defaultImage}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            {vehicle.isLeading && (
              <Badge className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0">
                <Trophy className="w-2.5 h-2.5 mr-0.5" />LIDER
              </Badge>
            )}
            {vehicle.isNew && !vehicle.isLeading && (
              <Badge className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0">
                NUEVA
              </Badge>
            )}
            {isHot && !vehicle.isNew && !vehicle.isLeading && (
              <Badge className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0">
                <Flame className="w-2.5 h-2.5 mr-0.5" />HOT
              </Badge>
            )}
          </Link>

          {/* Info */}
          <Link to={detailUrl} className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900/90 text-base leading-tight truncate">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-gray-500 text-xs">
                {vehicle.year} · {vehicle.mileage?.toLocaleString('es-CO')} km
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`font-bold text-lg ${vehicle.isLeading ? 'text-green-600' : 'text-violet-700'} w-[75px]`}>
                {formatPrice(vehicle.current_bid || 0)}
              </span>
              <span className="text-gray-400 text-xs flex items-center w-[36px]">
                <Users className="w-3 h-3 mr-0.5 flex-shrink-0" />
                {vehicle.bids_count || 0}
              </span>
            </div>
          </Link>

          {/* Tiempo y botón */}
          <div className="flex flex-col items-end justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite?.(vehicle.id);
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-500' 
                    : 'bg-gray-100 text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-1 rounded-full justify-center ${
                isUrgent 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="font-medium tabular-nums">{timeLeft}</span>
              </div>
            </div>
            
            <Button 
              onClick={() => onBid?.(vehicle)}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 h-8 rounded-full text-sm"
            >
              Pujar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}