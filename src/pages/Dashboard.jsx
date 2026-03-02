import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Trophy, Gavel, Bell, Calendar, CheckCircle, Clock, AlertCircle, Car, BarChart3, ArrowUpRight, ArrowDownRight, Users, Eye, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const demoData = {
  vehiculosActivos: 8, pujasRecibidas: 127, vehiculosVendidos: 24, ingresosEstimados: 2450000000,
  crecimientoMensual: 18, vistasTotales: 3420, tasaConversion: 34,
  notificaciones: [
    { id: 1, tipo: 'puja_alta', mensaje: 'Nueva puja de $145M en BMW X3 2021', tiempo: 'Hace 5 min', urgente: true },
    { id: 2, tipo: 'venta', mensaje: 'Mazda CX-5 2022 vendido por $108M', tiempo: 'Hace 15 min', urgente: false },
    { id: 3, tipo: 'alerta', mensaje: 'Subasta de Ford Ranger termina en 30 min', tiempo: 'Hace 20 min', urgente: true },
    { id: 4, tipo: 'info', mensaje: 'Nuevo comprador verificado en tu zona', tiempo: 'Hace 1 hora', urgente: false },
  ],
  ventasRecientes: [
    { id: 1, vehiculo: 'Mazda 3 2022', precio: 62000000, comprador: 'AutoMax', fecha: '2024-12-18', estado: 'completado' },
    { id: 2, vehiculo: 'Kia Sportage 2021', precio: 78000000, comprador: 'Los Coches', fecha: '2024-12-17', estado: 'en_pago' },
    { id: 3, vehiculo: 'Hyundai Tucson 2022', precio: 85000000, comprador: 'Sanautos', fecha: '2024-12-16', estado: 'completado' },
    { id: 4, vehiculo: 'Toyota RAV4 2021', precio: 98000000, comprador: 'Derco', fecha: '2024-12-15', estado: 'completado' },
  ],
  listaVehiculosActivos: [
    { id: 1, nombre: 'Ford Ranger 2020', pujas: 12, mayorPuja: 118000000, vistas: 245, tiempoRestante: '2h 15m' },
    { id: 2, nombre: 'Nissan Kicks 2023', pujas: 8, mayorPuja: 68000000, vistas: 189, tiempoRestante: '5h 30m' },
    { id: 3, nombre: 'BMW X3 2021', pujas: 15, mayorPuja: 145000000, vistas: 412, tiempoRestante: '1h 45m' },
  ],
  tendenciaVentas: [
    { mes: 'Jul', ventas: 18, ingresos: 1580 }, { mes: 'Ago', ventas: 22, ingresos: 1890 },
    { mes: 'Sep', ventas: 19, ingresos: 1720 }, { mes: 'Oct', ventas: 25, ingresos: 2150 },
    { mes: 'Nov', ventas: 28, ingresos: 2380 }, { mes: 'Dic', ventas: 24, ingresos: 2450 },
  ],
  distribucionVentas: [
    { tipo: 'SUV', valor: 45 }, { tipo: 'Sedan', valor: 30 }, { tipo: 'Pickup', valor: 18 }, { tipo: 'Hatchback', valor: 7 },
  ],
};

const COLORS = ['hsl(265, 90%, 55%)', 'hsl(142, 71%, 45%)', '#f59e0b', '#3b82f6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'dealer@test.com';
  const [data] = useState(isTestUser ? demoData : { vehiculosActivos: 0, pujasRecibidas: 0, vehiculosVendidos: 0, ingresosEstimados: 0, crecimientoMensual: 0, vistasTotales: 0, tasaConversion: 0, notificaciones: [], ventasRecientes: [], listaVehiculosActivos: [], tendenciaVentas: [], distribucionVentas: [] });
  const [selectedTab, setSelectedTab] = useState('resumen');

  useEffect(() => {
    const userRole = localStorage.getItem('mubis_user_role');
    if (userRole !== 'dealer') navigate(createPageUrl('Cuenta'));
  }, [navigate]);

  const formatCurrency = (amount) => `$${(amount / 1000000).toFixed(0)}M`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  const statsCards = [
    { icon: Car, value: data.vehiculosActivos, label: 'Activos', color: 'bg-secondary', change: '+3', positive: true },
    { icon: Gavel, value: data.pujasRecibidas, label: 'Pujas', color: 'bg-secondary', change: '+24', positive: true },
    { icon: Trophy, value: data.vehiculosVendidos, label: 'Vendidos', color: 'bg-primary', change: '+5', positive: true },
    { icon: DollarSign, value: formatCurrency(data.ingresosEstimados), label: 'Ingresos', color: 'bg-primary', change: `+${data.crecimientoMensual}%`, positive: true },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Cuenta'))} className="rounded-full text-white hover:bg-white/20"><ArrowLeft className="w-5 h-5" /></Button>
          <MubisLogo size="md" variant="light" />
          <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/20 relative"><Bell className="w-5 h-5" /><span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span></Button>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white font-serif">Dashboard</h1>
          <p className="text-white/70 text-xs">Panel de Control</p>
        </div>
      </div>

      <div className="px-4 -mt-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 mb-4">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
                  <Badge className={`${stat.positive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'} text-xs px-1.5 py-0`}>{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-2 mb-4">
          <Card className="p-3 border border-border shadow-sm text-center"><Eye className="w-5 h-5 text-secondary mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{data.vistasTotales}</p><p className="text-[10px] text-muted-foreground">Vistas</p></Card>
          <Card className="p-3 border border-border shadow-sm text-center"><Users className="w-5 h-5 text-secondary mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{data.tasaConversion}%</p><p className="text-[10px] text-muted-foreground">Conversión</p></Card>
          <Card className="p-3 border border-border shadow-sm text-center"><Zap className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{data.crecimientoMensual}%</p><p className="text-[10px] text-muted-foreground">Crecimiento</p></Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2 font-serif"><Bell className="w-4 h-4 text-secondary" />Notificaciones</h2>
            <Button variant="ghost" size="sm" className="text-xs text-secondary h-7">Ver todas</Button>
          </div>
          <div className="space-y-2">
            {data.notificaciones.slice(0, 3).map((notif) => (
              <Card key={notif.id} className={`p-3 border border-border shadow-sm ${notif.urgente ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''}`}>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.urgente ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium leading-tight">{notif.mensaje}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notif.tiempo}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2 font-serif"><Car className="w-4 h-4 text-secondary" />Vehículos Activos</h2>
            <Button variant="ghost" size="sm" className="text-xs text-secondary h-7">Ver todos</Button>
          </div>
          <div className="space-y-2">
            {data.listaVehiculosActivos.map((vehiculo) => (
              <Card key={vehiculo.id} className="p-3 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground text-sm">{vehiculo.nombre}</p>
                  <Badge className="bg-secondary/10 text-secondary text-xs">{vehiculo.tiempoRestante}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-muted-foreground">Pujas</p><p className="font-bold text-foreground">{vehiculo.pujas}</p></div>
                  <div><p className="text-muted-foreground">Mayor</p><p className="font-bold text-primary">{formatCurrency(vehiculo.mayorPuja)}</p></div>
                  <div><p className="text-muted-foreground">Vistas</p><p className="font-bold text-foreground">{vehiculo.vistas}</p></div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-foreground text-sm flex items-center gap-2 font-serif"><CheckCircle className="w-4 h-4 text-primary" />Ventas Recientes</h2>
          </div>
          <div className="space-y-2">
            {data.ventasRecientes.map((venta) => (
              <Card key={venta.id} className="p-3 border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{venta.vehiculo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{venta.comprador}</p>
                      <span className="text-border">•</span>
                      <p className="text-xs text-muted-foreground">{formatDate(venta.fecha)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">{formatCurrency(venta.precio)}</p>
                    <Badge className={`mt-1 text-xs ${venta.estado === 'completado' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                      {venta.estado === 'completado' ? 'Pagado' : 'En proceso'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-4">
          <Card className="p-4 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-secondary" /><h3 className="font-bold text-foreground text-sm font-serif">Tendencia de Ingresos</h3></div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.tendenciaVentas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => `$${value}M`} />
                <Line type="monotone" dataKey="ingresos" stroke="hsl(265, 90%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(265, 90%, 55%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-3 border border-border shadow-sm">
            <h3 className="font-bold text-foreground text-xs mb-2">Ventas Mensuales</h3>
            <ResponsiveContainer width="100%" height={120}><BarChart data={data.tendenciaVentas}><Bar dataKey="ventas" fill="hsl(265, 90%, 55%)" radius={[4, 4, 0, 0]} /><Tooltip contentStyle={{ fontSize: '11px' }} formatter={(value) => `${value} ventas`} /></BarChart></ResponsiveContainer>
          </Card>
          <Card className="p-3 border border-border shadow-sm">
            <h3 className="font-bold text-foreground text-xs mb-2">Por Categoría</h3>
            <ResponsiveContainer width="100%" height={120}><PieChart><Pie data={data.distribucionVentas} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="valor">{data.distribucionVentas.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ fontSize: '11px' }} formatter={(value) => `${value}%`} /></PieChart></ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-4">
          <Card className="p-3 border border-border shadow-sm">
            <div className="grid grid-cols-2 gap-2">
              {data.distribucionVentas.map((item, i) => (
                <div key={item.tipo} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-xs text-muted-foreground">{item.tipo}</span>
                  <span className="text-xs font-bold text-foreground ml-auto">{item.valor}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      <BottomNav currentPage="Cuenta" />
    </div>
  );
}
