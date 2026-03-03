import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import { getActiveAuctions } from '@/lib/mockStore';

export default function AdminSubastas() {
  const auctions = getActiveAuctions();
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16"><MubisLogo size="lg" /></div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-4 font-sans">Subastas</h1>
        {auctions.length === 0 ? (
          <Card className="p-8 text-center border border-border"><p className="text-muted-foreground">No hay subastas activas</p></Card>
        ) : (
          <div className="space-y-3">
            {auctions.map(a => (
              <Card key={a.id} className="p-4 border border-border rounded-xl">
                <div className="flex items-center justify-between">
                  <div><p className="font-bold text-foreground">{a.brand} {a.model}</p><p className="text-xs text-muted-foreground">{a.year} · {a.city}</p></div>
                  <div className="text-right"><p className="font-bold text-primary">{formatPrice(a.current_bid)}</p><Badge className="bg-primary/10 text-primary text-xs">{a.bids_count} pujas</Badge></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
