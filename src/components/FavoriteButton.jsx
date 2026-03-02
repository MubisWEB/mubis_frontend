import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function FavoriteButton({ vehicleId, className }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const dealerEmail = localStorage.getItem('mubis_user_email');
  const userRole = localStorage.getItem('mubis_user_role');

  useEffect(() => {
    if (userRole !== 'dealer') return;
    
    checkFavoriteStatus();
  }, [vehicleId]);

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await base44.entities.FavoriteVehicle.filter({
        vehicle_id: vehicleId,
        dealer_email: dealerEmail
      });
      setIsFavorite(favorites.length > 0);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (userRole !== 'dealer') {
      toast.error('Solo los dealers pueden marcar favoritos');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        const favorites = await base44.entities.FavoriteVehicle.filter({
          vehicle_id: vehicleId,
          dealer_email: dealerEmail
        });
        if (favorites.length > 0) {
          await base44.entities.FavoriteVehicle.delete(favorites[0].id);
        }
        setIsFavorite(false);
        toast.success('Removido de favoritos');
      } else {
        await base44.entities.FavoriteVehicle.create({
          vehicle_id: vehicleId,
          dealer_email: dealerEmail
        });
        setIsFavorite(true);
        toast.success('Agregado a favoritos');
      }
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'dealer') return null;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(
        "p-2 rounded-full transition-all",
        isFavorite 
          ? "bg-red-100 text-red-600" 
          : "bg-white/90 text-gray-400 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-5 h-5",
          isFavorite && "fill-current"
        )} 
      />
    </button>
  );
}