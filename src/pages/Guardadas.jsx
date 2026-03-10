import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import VehicleCard from '@/components/VehicleCard';
import BidModal from '@/components/BidModal';
import { Bookmark } from 'lucide-react';
import { getCurrentUser, getWatchlistByUserId, toggleWatchlist, addBid, updateAuction } from '@/lib/mockStore';
import { toast } from 'sonner';

export default function Guardadas() {
  const currentUser = getCurrentUser();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  const load = () => {
    if (currentUser) setVehicles(getWatchlistByUserId(currentUser.id));
  };

  useEffect(() => { load(); }, []);

  const handleBid = (vehicle) => { setSelectedVehicle(vehicle); setBidModalOpen(true); };

  const handleSubmitBid = (amount) => {
    if (!selectedVehicle || !currentUser) return;
    addBid({ auctionId: selectedVehicle.id, userId: currentUser.id, amount, userName: 'Postor anónimo' });
    updateAuction(selectedVehicle.id, { current_bid: amount, bids_count: (selectedVehicle.bids_count || 0) + 1 });
    load();
    toast.success('Puja registrada');
  };

  const handleToggleWatchlist = (vehicle) => {
    if (!currentUser) return;
    toggleWatchlist(currentUser.id, vehicle.id);
    load();
    toast.success('Eliminada de guardados');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32 md:pb-12">
      <Header title="Guardadas" />
      <div className="px-4 md:px-8 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-foreground font-sans">Guardadas</p>
          <span className="text-sm text-muted-foreground">{vehicles.length} vehículos</span>
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
