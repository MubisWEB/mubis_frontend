import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import BidModal from '@/components/BidModal';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { watchlistApi, bidsApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';

const CardSkeleton = () => (
  <div className="rounded-2xl border border-border overflow-hidden bg-card">
    <Skeleton height={170} borderRadius={0} />
    <div className="p-3.5">
      <Skeleton width="55%" height={16} />
      <Skeleton width="35%" height={12} style={{ marginTop: 4 }} />
      <Skeleton width={80} height={22} style={{ marginTop: 10 }} />
    </div>
  </div>
);

export default function Guardadas() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await watchlistApi.getAll();
      setVehicles(data || []);
    } catch (err) {
      console.error('Error loading watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = async (maxAmount) => {
    if (!selectedVehicle || !currentUser) return;
    try {
      const result = await bidsApi.place(selectedVehicle.id, maxAmount);
      await load();
      if (result?.outbid) {
        toast.error('No lideras esta subasta', { description: 'Ya existe una puja máxima superior.' });
      } else {
        toast.success('¡Lideras la subasta!');
      }
      return result;
    } catch (err) {
      toast.error('Error al colocar la puja');
    }
  };

  const handleToggleWatchlist = async (vehicle) => {
    if (!currentUser) return;
    try {
      await watchlistApi.toggle(vehicle.id);
      await load();
      toast.success('Eliminada de guardados');
    } catch (err) {
      toast.error('Error al actualizar guardados');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <Header />
      <div className="px-4 md:px-8 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/Comprar')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Guardadas</h1>
            <p className="text-xs text-muted-foreground">{vehicles.length} vehículos</p>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Aún no has guardado subastas</p>
            <p className="text-xs text-muted-foreground mt-1">Guarda subastas desde Comprar para verlas aquí</p>
          </div>
        ) : (
          <>
            {/* Mobile: compact */}
            <div className="space-y-3 md:hidden">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} onToggleFavorite={() => handleToggleWatchlist(vehicle)} isFavorite={true} index={index} variant="compact" />
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onBid={handleBid} onToggleFavorite={() => handleToggleWatchlist(vehicle)} isFavorite={true} index={index} variant="grid" />
              ))}
            </div>
          </>
        )}
      </div>
      <BidModal vehicle={selectedVehicle} open={bidModalOpen} onClose={() => setBidModalOpen(false)} onSubmit={handleSubmitBid} />
      <BottomNav />
    </div>
  );
}
