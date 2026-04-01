import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Car, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import AdminNavbar from '@/components/AdminNavbar';
import Header from '@/components/Header';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

// Mock data
const mockMonthlyData = [
  { month: 'Ene', ventas: 45000000, comisiones: 2250000, vehículos: 12 },
  { month: 'Feb', ventas: 52000000, comisiones: 2600000, vehículos: 15 },
  { month: 'Mar', ventas: 48000000, comisiones: 2400000, vehículos: 13 },
  { month: 'Abr', ventas: 61000000, comisiones: 3050000, vehículos: 18 },
  { month: 'May', ventas: 55000000, comisiones: 2750000, vehículos: 14 },
];

const mockBranchStats = [
  { name: 'Vehículos Activos', value: 48, color: '#6366f1' },
  { name: 'Subastas Completadas', value: 156, color: '#10b981' },
  { name: 'En Espera', value: 12, color: '#f59e0b' },
  { name: 'Canceladas', value: 8, color: '#ef4444' },
];

export default function BranchAdminDashboard() {
  const [loading] = useState(false);

  // Placeholder stats
  const stats = [
    { label: 'Total Vehículos', value: '48', icon: Car, change: '+5.2%', trend: 'up' },
    { label: 'Subastas Activas', value: '12', icon: TrendingUp, change: '+2.1%', trend: 'up' },
    { label: 'Ingresos este mes', value: COP(61000000), icon: DollarSign, change: '+12.5%', trend: 'up' },
    { label: 'Usuarios Activos', value: '24', icon: Users, change: '-1.2%', trend: 'down' },
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <Header />
      
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - Sucursal</h1>
          <p className="text-gray-600 mt-2">Resumen de actividad y estadísticas de tu sucursal</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-indigo-600" />
                  <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart - Ventas */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold mb-4">Ventas por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => COP(value)} />
                <Line type="monotone" dataKey="ventas" stroke="#6366f1" strokeWidth={2} name="Ventas" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart - Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockBranchStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockBranchStats.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bar Chart - Vehicles per Month */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Vehículos Publicados por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vehículos" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Comisiones Este Mes</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">{COP(mockMonthlyData[3].comisiones)}</p>
            <p className="text-sm text-gray-600">Basado en vehículos subastados</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Desempeño Reciente</h3>
            <p className="text-gray-600 text-sm mb-2">✓ 18 vehículos publicados este mes</p>
            <p className="text-gray-600 text-sm mb-2">✓ Tasa de conversión: 85%</p>
            <p className="text-gray-600 text-sm">✓ Tiempo promedio de venta: 14 días</p>
          </Card>
        </div>
      </div>

      <AdminNavbar 
        dashboardPath="/BranchAdminDashboard"
        usersPath="/BranchAdminUsuarios"
        role="branch_admin"
      />
    </div>
  );
}
