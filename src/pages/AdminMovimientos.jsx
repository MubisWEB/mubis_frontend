import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { DollarSign } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getBids } from '@/lib/mockStore';

export default function AdminMovimientos() {
  const [bids, setBids] = useState([]);

  useEffect(() => { setBids(getBids()); }, []);

  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Movimientos" subtitle={`${bids.length} transacciones`} backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {bids.length === 0 ? (
          <div className="text-center py-12"><DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No hay movimientos registrados</p></div>
        ) : (
          <div className="space-y-2">
            {bids.map(bid => (
              <Card key={bid.id} className="p-3 border border-border shadow-sm flex justify-between items-center">
                <div><p className="text-sm font-medium text-foreground">{bid.userName || 'Postor anónimo'}</p><p className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString('es-CO')}</p></div>
                <span className="font-bold text-foreground">{formatPrice(bid.amount)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
