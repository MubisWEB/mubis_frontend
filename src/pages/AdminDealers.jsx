import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Shield, MapPin, Phone, Mail, Building } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getUsers, getAuctionsByDealerId, getBidsByUserId, getInspections } from '@/lib/mockStore';

const STATUS_BADGE = {
  VERIFIED: { label: 'Verificado', cls: 'bg-primary/10 text-primary' },
  PENDING: { label: 'Pendiente', cls: 'bg-accent/10 text-accent-foreground' },
  REJECTED: { label: 'Rechazado', cls: 'bg-destructive/10 text-destructive' },
  SUSPENDED: { label: 'Suspendido', cls: 'bg-destructive/10 text-destructive' },
};

export default function AdminDealers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('VERIFIED');

  useEffect(() => {
    const all = getUsers().filter(u => u.role !== 'admin');
    setUsers(all);
  }, []);

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.verification_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.nombre || '').toLowerCase().includes(q) || (u.company || '').toLowerCase().includes(q) || (u.ciudad || '').toLowerCase().includes(q);
    }
    return true;
  });

  const getUserActivity = (user) => {
    if (user.role === 'dealer') {
      const auctions = getAuctionsByDealerId(user.id);
      return `${auctions.length} subastas`;
    }
    if (user.role === 'recomprador') {
      const bids = getBidsByUserId(user.id);
      return `${bids.length} pujas`;
    }
    if (user.role === 'perito') {
      const inspections = getInspections().filter(i => i.peritoId === user.id);
      return `${inspections.length} peritajes`;
    }
    return '';
  };

  const statusInfo = (s) => STATUS_BADGE[s] || STATUS_BADGE.PENDING;

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Usuarios" subtitle={`${filtered.length} usuarios`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, empresa o ciudad..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 bg-card border border-border shadow-sm rounded-xl" />
        </div>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          {[{ key: 'all', label: 'Todos' }, { key: 'dealer', label: 'Dealers' }, { key: 'perito', label: 'Peritos' }, { key: 'recomprador', label: 'Recompradores' }].map(tab => (
            <Button key={tab.key} variant={roleFilter === tab.key ? 'default' : 'outline'} size="sm"
              onClick={() => setRoleFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">{tab.label}</Button>
          ))}
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[{ key: 'all', label: 'Todos' }, { key: 'VERIFIED', label: 'Verificados' }, { key: 'PENDING', label: 'Pendientes' }, { key: 'REJECTED', label: 'Rechazados' }].map(tab => (
            <Button key={tab.key} variant={statusFilter === tab.key ? 'secondary' : 'ghost'} size="sm"
              onClick={() => setStatusFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">{tab.label}</Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No hay usuarios con estos filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(user => {
              const si = statusInfo(user.verification_status);
              return (
                <Card key={user.id} className="p-4 border border-border shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{user.nombre}</h3>
                        {user.verification_status === 'VERIFIED' && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{user.ciudad}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={si.cls + ' text-xs'}>{si.label}</Badge>
                      <Badge className="bg-secondary/10 text-secondary text-xs">{user.role}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building className="w-3 h-3" />{user.company} · {user.branch}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{user.email}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{user.telefono}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Actividad: {getUserActivity(user)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
