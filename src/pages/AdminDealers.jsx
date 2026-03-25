import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Shield, MapPin, Phone, Mail, Building, Car, DollarSign, Banknote, ArrowUpDown } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { usersApi, companiesApi } from '@/api/services';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);

const STATUS_BADGE = {
  VERIFIED: { label: 'Verificado', cls: 'bg-primary/10 text-primary' },
  PENDING: { label: 'Pendiente', cls: 'bg-amber-500/10 text-amber-600' },
  REJECTED: { label: 'Rechazado', cls: 'bg-destructive/10 text-destructive' },
  WAITLISTED: { label: 'En espera', cls: 'bg-amber-500/10 text-amber-600' },
};

const ROLE_LABELS = {
  dealer: 'Dealer', DEALER: 'Dealer',
  perito: 'Perito', PERITO: 'Perito',
  recomprador: 'Recomprador', RECOMPRADOR: 'Recomprador',
};

export default function AdminDealers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('VERIFIED');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // name, sold, bought, brokerage

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, companiesData] = await Promise.all([
          usersApi.getAll(),
          companiesApi.getAll().catch(() => []),
        ]);
        setUsers((userData || []).filter(u => u.role !== 'superadmin' && u.role !== 'SUPERADMIN'));
        setCompanies((companiesData || []).filter(c => c.active));
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users
    .filter(u => {
      if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter) return false;
      if (statusFilter !== 'all' && u.verification_status !== statusFilter) return false;
      if (companyFilter !== 'all' && u.company !== companyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (u.nombre || '').toLowerCase().includes(q) ||
               (u.company || '').toLowerCase().includes(q) ||
               (u.ciudad || '').toLowerCase().includes(q) ||
               (u.email || '').toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sold': return (b.vehiclesSold || 0) - (a.vehiclesSold || 0);
        case 'bought': return (b.vehiclesBought || 0) - (a.vehiclesBought || 0);
        case 'brokerage': return (b.brokerage || 0) - (a.brokerage || 0);
        default: return (a.nombre || '').localeCompare(b.nombre || '');
      }
    });

  // Grouped stats
  const companyGroups = {};
  users.filter(u => u.verification_status === 'VERIFIED').forEach(u => {
    const key = u.company || 'Sin empresa';
    if (!companyGroups[key]) companyGroups[key] = { sold: 0, bought: 0, brokerage: 0, count: 0 };
    companyGroups[key].sold += (u.vehiclesSold || 0);
    companyGroups[key].bought += (u.vehiclesBought || 0);
    companyGroups[key].brokerage += (u.brokerage || 0);
    companyGroups[key].count += 1;
  });

  const statusInfo = (s) => STATUS_BADGE[s] || STATUS_BADGE.PENDING;

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Usuarios" subtitle={`${filtered.length} usuarios`} backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, empresa, ciudad o email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-card border border-border shadow-sm rounded-xl" />
        </div>

        {/* Filters row */}
        <div className="flex gap-2 flex-wrap">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="flex-1 min-w-[140px] h-9 text-xs rounded-lg border-border">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las empresas</SelectItem>
              {companies.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-9 text-xs rounded-lg border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="sold">Más vendidos</SelectItem>
              <SelectItem value="bought">Más comprados</SelectItem>
              <SelectItem value="brokerage">Mayor corretaje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[{ key: 'all', label: 'Todos' }, { key: 'dealer', label: 'Dealers' }, { key: 'perito', label: 'Peritos' }, { key: 'recomprador', label: 'Recompradores' }].map(tab => (
            <Button key={tab.key} variant={roleFilter === tab.key ? 'default' : 'outline'} size="sm"
              onClick={() => setRoleFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">{tab.label}</Button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'VERIFIED', label: 'Verificados' },
            { key: 'PENDING', label: 'Pendientes' },
            { key: 'WAITLISTED', label: 'En espera' },
            { key: 'REJECTED', label: 'Rechazados' },
          ].map(tab => (
            <Button key={tab.key} variant={statusFilter === tab.key ? 'secondary' : 'ghost'} size="sm"
              onClick={() => setStatusFilter(tab.key)} className="rounded-full text-xs flex-shrink-0">{tab.label}</Button>
          ))}
        </div>

        {/* Company summary (when filtering by company) */}
        {companyFilter !== 'all' && companyGroups[companyFilter] && (
          <Card className="p-3 border border-secondary/30 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm">{companyFilter}</h3>
              <Badge className="bg-secondary/10 text-secondary text-xs">
                {companyGroups[companyFilter].count} usuarios
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-bold text-foreground">{companyGroups[companyFilter].sold}</p>
                <p className="text-[10px] text-muted-foreground">Vendidos</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-bold text-foreground">{companyGroups[companyFilter].bought}</p>
                <p className="text-[10px] text-muted-foreground">Comprados</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-sm font-bold text-primary">{COP(companyGroups[companyFilter].brokerage)}</p>
                <p className="text-[10px] text-muted-foreground">Corretaje</p>
              </div>
            </div>
          </Card>
        )}

        {/* User list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
                <Skeleton circle width={40} height={40} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="65%" height={14} />
                  <Skeleton width="40%" height={11} style={{ marginTop: 5 }} />
                </div>
                <Skeleton width={72} height={22} borderRadius={999} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No hay usuarios con estos filtros</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(user => {
              const si = statusInfo(user.verification_status);
              return (
                <Card key={user.id} className="p-4 border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/AdminDealerDetalle/${user.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{user.nombre}</h3>
                        {user.verification_status === 'VERIFIED' && <Shield className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />{user.ciudad}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={si.cls + ' text-xs'}>{si.label}</Badge>
                      <Badge className="bg-secondary/10 text-secondary text-xs">
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="w-3 h-3" />{user.company} · {user.branch}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />{user.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />{user.telefono}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    {user.vehiclesSold !== undefined && (
                      <div className="flex items-center gap-1 text-xs">
                        <Car className="w-3 h-3 text-secondary" />
                        <span className="text-muted-foreground">{user.vehiclesSold} vendidos</span>
                      </div>
                    )}
                    {user.vehiclesBought !== undefined && (
                      <div className="flex items-center gap-1 text-xs">
                        <Car className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">{user.vehiclesBought} comprados</span>
                      </div>
                    )}
                    {user.brokerage > 0 && (
                      <div className="flex items-center gap-1 text-xs ml-auto">
                        <Banknote className="w-3 h-3 text-primary" />
                        <span className="font-medium text-primary">{COP(user.brokerage)}</span>
                      </div>
                    )}
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
