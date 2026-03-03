import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gavel } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getAuctions } from '@/lib/mockStore';

export default function AdminSubastas() {
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { setAuctions(getAuctions()); }, []);

  const filtered = filter === 'all' ? auctions : auctions.filter(a => a.status === filter);
  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Subastas" subtitle={`${auctions.length} subastas totales`} backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          {[{ key: 'all', label: 'Todas' }, { key: 'active', label: 'Activas' }, { key: 'closed', label: 'Cerradas' }].map(tab => (
            <Button key={tab.key} variant={filter === tab.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(tab.key)} className="rounded-full text-xs">{tab.label}</Button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12"><Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No hay subastas</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <Card key={a.id} className="p-4 border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div><h3 className="font-bold text-foreground">{a.brand} {a.model}</h3><p className="text-xs text-muted-foreground">{a.year} · {a.city}</p></div>
                  <Badge className={a.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}>{a.status === 'active' ? 'Activa' : 'Cerrada'}</Badge>
                </div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Puja actual</span><span className="font-bold text-foreground">{formatPrice(a.current_bid || 0)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pujas</span><span className="text-foreground">{a.bids_count || 0}</span></div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
