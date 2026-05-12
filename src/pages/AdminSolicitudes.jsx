import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, Building2,
  Search, Trash2, UserCheck, AlertTriangle, Users, ShieldOff,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { usersApi } from '@/api/services';
import { useAuth } from '@/lib/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  dealer: 'Dealer',
  perito: 'Perito',
  recomprador: 'Recomprador',
  admin_general: 'Admin General',
  admin_sucursal: 'Admin Sucursal',
};

const ROLE_COLORS = {
  dealer:        'bg-blue-100 text-blue-700',
  perito:        'bg-orange-100 text-orange-700',
  recomprador:   'bg-secondary/15 text-secondary',
  admin_general: 'bg-gray-100 text-gray-600',
  admin_sucursal:'bg-gray-100 text-gray-600',
};

const TABS = [
  { key: 'PENDING',    label: 'Pendientes',   color: 'amber',  Icon: Clock         },
  { key: 'WAITLISTED', label: 'En espera',     color: 'blue',   Icon: Users         },
  { key: 'VERIFIED',   label: 'Verificados',  color: 'green',  Icon: UserCheck     },
  { key: 'REJECTED',   label: 'Rechazados',   color: 'red',    Icon: XCircle       },
];

const TAB_STYLES = {
  amber: { active: 'bg-amber-50 border-amber-400 text-amber-700',   count: 'text-amber-600', dot: 'bg-amber-400' },
  blue:  { active: 'bg-blue-50 border-blue-400 text-blue-700',      count: 'text-blue-600',  dot: 'bg-blue-400'  },
  green: { active: 'bg-green-50 border-green-500 text-green-700',   count: 'text-green-600', dot: 'bg-green-500' },
  red:   { active: 'bg-red-50 border-red-400 text-red-600',         count: 'text-red-500',   dot: 'bg-red-400'   },
};

const ROLE_FILTERS = [
  { key: 'all',          label: 'Todos'         },
  { key: 'dealer',       label: 'Dealers'       },
  { key: 'perito',       label: 'Peritos'       },
  { key: 'recomprador',  label: 'Recompradores' },
];

function fmtDate(d) {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7)  return `Hace ${diff} días`;
  return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

// ─── User card ────────────────────────────────────────────────────────────────

function UserCard({ user, activeTab, isSuperadmin, onAction, onDelete }) {
  const isVerified = activeTab === 'VERIFIED';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Top strip — color by status */}
      <div className={`h-1 w-full ${
        activeTab === 'PENDING'    ? 'bg-amber-400' :
        activeTab === 'WAITLISTED' ? 'bg-blue-400' :
        activeTab === 'VERIFIED'   ? 'bg-green-500' :
        'bg-red-400'
      }`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            ROLE_COLORS[user.role] ?? 'bg-muted text-muted-foreground'
          }`}>
            {initials(user.nombre)}
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate max-w-[160px]">
                {user.nombre}
              </h3>
              <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${ROLE_COLORS[user.role] ?? 'bg-muted text-muted-foreground'}`}>
                {ROLE_LABELS[user.role] || user.role}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="space-y-1.5 mb-4">
          {(user.company || user.branch) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 flex-shrink-0 text-secondary/60" />
              <span className="truncate">{user.company || 'Sin empresa'}{user.branch ? ` · ${user.branch}` : ''}</span>
            </div>
          )}
          {user.ciudad && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0 text-secondary/60" />
              <span>{user.ciudad}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0 text-secondary/60" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.telefono && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3 h-3 flex-shrink-0 text-secondary/60" />
              <span>{user.telefono}</span>
            </div>
          )}
          {user.nit && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 flex-shrink-0 text-secondary/60" />
              <span>NIT: {user.nit}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-3" />

        {/* Actions */}
        {isVerified ? (
          /* Verified users: only revoke + delete */
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onAction(user, 'PENDING')}
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
              Cancelar verificación
            </Button>
            {isSuperadmin && (
              <Button
                onClick={() => onDelete(user)}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ) : (
          /* Pending / waitlisted / rejected: approve + contextual secondary + delete */
          <div className="space-y-2">
            {/* Primary action: Approve */}
            <Button
              onClick={() => onAction(user, 'VERIFIED')}
              size="sm"
              className="w-full h-9 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Aprobar
            </Button>

            {/* Secondary row */}
            <div className="flex gap-2">
              {activeTab !== 'WAITLISTED' && (
                <Button
                  onClick={() => onAction(user, 'WAITLISTED')}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs rounded-xl border-border text-muted-foreground hover:text-amber-700 hover:border-amber-300"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  En espera
                </Button>
              )}
              {activeTab !== 'REJECTED' && (
                <Button
                  onClick={() => onAction(user, 'REJECTED')}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs rounded-xl border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Rechazar
                </Button>
              )}
              {activeTab === 'REJECTED' && (
                <Button
                  onClick={() => onAction(user, 'PENDING')}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs rounded-xl border-border text-muted-foreground hover:text-amber-700 hover:border-amber-300"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Revisar de nuevo
                </Button>
              )}
              {isSuperadmin && (
                <Button
                  onClick={() => onDelete(user)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSolicitudes() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';
  const backTo = user?.role === 'admin_general'   ? '/AdminGeneralDashboard'
               : user?.role === 'admin_sucursal'  ? '/AdminSucursalDashboard'
               : '/AdminDashboard';

  const [activeTab,   setActiveTab]   = useState('PENDING');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [search,      setSearch]      = useState('');
  const [requests,    setRequests]    = useState([]);
  const [allUsers,    setAllUsers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,    setDeleting]    = useState(false);

  const loadData = async () => {
    try {
      const [pending, users] = await Promise.all([
        usersApi.getPending().catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setRequests(pending || []);
      setAllUsers(users  || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 15_000);
    return () => clearInterval(id);
  }, []);

  const handleAction = async (target, status) => {
    const LABELS = {
      VERIFIED:   { msg: 'Usuario aprobado',       desc: `${target.nombre} ahora puede acceder a la plataforma`, type: 'success' },
      REJECTED:   { msg: 'Solicitud rechazada',    desc: `Se rechazó la solicitud de ${target.nombre}`,          type: 'error'   },
      WAITLISTED: { msg: 'En lista de espera',     desc: `${target.nombre} quedó en lista de espera`,            type: 'info'    },
      PENDING:    { msg: 'Verificación cancelada', desc: `${target.nombre} volvió a estado pendiente`,           type: 'info'    },
    };
    try {
      await usersApi.verify(target.id, status);
      const l = LABELS[status];
      if (l.type === 'error') toast.error(l.msg, { description: l.desc });
      else                    toast.success(l.msg, { description: l.desc });
      loadData();
    } catch {
      toast.error('Error al procesar la solicitud');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !isSuperadmin) return;
    setDeleting(true);
    try {
      await usersApi.remove(deleteTarget.id);
      toast.success('Usuario eliminado', { description: deleteTarget.email });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter logic ──────────────────────────────────────────────────────────

  const getList = () => {
    let list =
      activeTab === 'PENDING'
        ? requests
        : allUsers.filter(u => u.verification_status === activeTab && u.role !== 'superadmin');

    if (roleFilter !== 'all') list = list.filter(r => r.role?.toLowerCase() === roleFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.nombre  || '').toLowerCase().includes(q) ||
        (r.email   || '').toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q)
      );
    }
    return list;
  };

  const filteredList = getList();

  const counts = {
    PENDING:    requests.length,
    WAITLISTED: allUsers.filter(u => u.verification_status === 'WAITLISTED' && u.role !== 'superadmin').length,
    VERIFIED:   allUsers.filter(u => u.verification_status === 'VERIFIED'   && u.role !== 'superadmin').length,
    REJECTED:   allUsers.filter(u => u.verification_status === 'REJECTED'   && u.role !== 'superadmin').length,
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header
        title="Solicitudes de acceso"
        subtitle={`${counts.PENDING} pendientes · ${counts.WAITLISTED} en espera`}

      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 pt-4 space-y-4">

        {/* ── Tabs ── */}
        <div className="grid grid-cols-4 gap-2">
          {TABS.map(tab => {
            const s      = TAB_STYLES[tab.color];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center py-3 px-2 rounded-xl border transition-all ${
                  isActive
                    ? `${s.active} border shadow-sm`
                    : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                {counts[tab.key] > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${s.dot}`}>
                    {counts[tab.key] > 99 ? '99+' : counts[tab.key]}
                  </span>
                )}
                <tab.Icon className={`w-4 h-4 mb-1 ${isActive ? '' : 'opacity-50'}`} />
                <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Search + role filter ── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 bg-card border border-border shadow-sm rounded-xl text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="h-10 px-3 pr-8 rounded-xl border border-border bg-card text-sm text-foreground shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary/30"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {ROLE_FILTERS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2, 4].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-muted rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
              {activeTab === 'VERIFIED'
                ? <UserCheck className="w-7 h-7 text-green-500" />
                : <CheckCircle2 className="w-7 h-7 text-primary" />
              }
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {activeTab === 'PENDING'    ? 'Todo al día' :
               activeTab === 'WAITLISTED' ? 'Lista de espera vacía' :
               activeTab === 'VERIFIED'   ? 'Sin usuarios verificados' :
               'Sin solicitudes rechazadas'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'PENDING'    ? 'No hay solicitudes pendientes' :
               activeTab === 'WAITLISTED' ? 'No hay usuarios en espera' :
               activeTab === 'VERIFIED'   ? 'Aún no has aprobado ningún usuario' :
               'No hay solicitudes rechazadas'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredList.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  activeTab={activeTab}
                  isSuperadmin={isSuperadmin}
                  onAction={handleAction}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Eliminar usuario
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar a{' '}
              <strong className="text-foreground">{deleteTarget?.nombre}</strong>?
              Esta acción <strong>no se puede deshacer</strong>.
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
