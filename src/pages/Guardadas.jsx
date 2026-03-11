import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import BidModal from '@/components/BidModal';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getWatchlistByUserId, toggleWatchlist, addBid } from '@/lib/mockStore';
import { toast } from 'sonner';

export default function Guardadas() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  const load = () => {
    if (currentUser) setVehicles(getWatchlistByUserId(currentUser.id));
  };

  useEffect(() => { load(); }, []);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = (maxAmount) => {
    if (!selectedVehicle || !currentUser) return;
    const result = addBid({ auctionId: selectedVehicle.id, userId: currentUser.id, amount: maxAmount, userName: 'Postor anónimo' });
    load();
    if (result.outbid) {
      toast.error('No lideras esta subasta', { description: 'Ya existe una puja máxima superior.' });
    } else {
      toast.success('¡Lideras la subasta!');
    }
    return result;
  };

  const handleToggleWatchlist = (vehicle) => {
    if (!currentUser) return;
    toggleWatchlist(currentUser.id, vehicle.id);
    load();
    toast.success('Eliminada de guardados');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32 md:pb-12">
      <Header />
      <div className="px-4 md:px-8 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Guardadas</h1>
            <p className="text-xs text-muted-foreground">{vehicles.length} vehículos</p>
          </div>
        </div>
        {vehicles.length === 0 ? (
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
