import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Gavel, Eye, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/services';

export default function AdminSubastas() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => { adminApi.getAuctions().then(setAuctions).catch(() => {}); }, []);

  const companies = useMemo(() => [...new Set(auctions.map(a => a.dealerCompany).filter(Boolean))], [auctions]);
  const branches = useMemo(() => [...new Set(auctions.map(a => a.dealerBranch).filter(Boolean))], [auctions]);

  const filtered = useMemo(() => {
    let list = [...auctions];
    if (statusFilter !== 'all') list = list.filter(a => statusFilter === 'active' ? a.status === 'active' : (a.status === 'ended' || a.status === 'closed'));
    if (companyFilter !== 'all') list = list.filter(a => a.dealerCompany === companyFilter);
    if (branchFilter !== 'all') list = list.filter(a => a.dealerBranch === branchFilter);
    if (searchQ) { const q = searchQ.toLowerCase(); list = list.filter(a => `${a.brand} ${a.model} ${a.placa}`.toLowerCase().includes(q)); }
    return list;
  }, [auctions, statusFilter, companyFilter, branchFilter, searchQ]);

  const formatPrice = (p) => `$${(p / 1000000).toFixed(1)}M`;
  const getTimeLeft = (a) => {
    if (a.status !== 'active') return '—';
    const diff = new Date(a.ends_at) - new Date();
    if (diff <= 0) return 'Expirada';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <Header title="Subastas" subtitle={`${auctions.length} subastas totales`} backTo="/AdminDashboard" />
      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        <Card className="p-3 border border-border shadow-sm rounded-xl">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 text-sm rounded-xl"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="ended">Cerradas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm rounded-xl"><SelectValue placeholder="Empresa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {companies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[140px] h-9 text-sm rounded-xl"><SelectValue placeholder="Sucursal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <div className="text-center py-12"><Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No hay subastas con estos filtros</p></div>
        ) : (
          <Card className="border border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Marca</TableHead>
                    <TableHead className="text-xs">Modelo</TableHead>
                    <TableHead className="text-xs">Año</TableHead>
                    <TableHead className="text-xs">Km</TableHead>
                    <TableHead className="text-xs">Placa</TableHead>
                    <TableHead className="text-xs">Empresa</TableHead>
                    <TableHead className="text-xs">Sucursal</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Tiempo</TableHead>
                    <TableHead className="text-xs">Puja</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id} className="text-xs">
                      <TableCell className="whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString('es-CO')}</TableCell>
                      <TableCell>{a.brand}</TableCell>
                      <TableCell>{a.model}</TableCell>
                      <TableCell>{a.year}</TableCell>
                      <TableCell>{(a.km || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{a.placa}</TableCell>
                      <TableCell>{a.dealerCompany || '—'}</TableCell>
                      <TableCell>{a.dealerBranch || '—'}</TableCell>
                      <TableCell>
                        <Badge className={a.status === 'active' ? 'bg-primary/10 text-primary text-[10px]' : 'bg-muted text-muted-foreground text-[10px]'}>
                          {a.status === 'active' ? 'Activa' : 'Cerrada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getTimeLeft(a)}</TableCell>
                      <TableCell className="font-semibold">{formatPrice(a.current_bid || 0)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigate(`/DetalleSubasta/${a.id}`)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">{filtered.length} de {auctions.length} subastas</p>
      </div>
      <BottomNav />
    </div>
  );
}
