import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Building2, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import AdminNavbar from '@/components/AdminNavbar';
import Header from '@/components/Header';

const COP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0);
const NUM = (n) => new Intl.NumberFormat('es-CO').format(n || 0);

// Mock data
const mockMonthlyData = [
  { month: 'Ene', ventas: 145000000, comisiones: 7250000, vehículos: 38, sucursales: 5 },
  { month: 'Feb', ventas: 162000000, comisiones: 8100000, vehículos: 45, sucursales: 5 },
  { month: 'Mar', ventas: 148000000, comisiones: 7400000, vehículos: 42, sucursales: 5 },
  { month: 'Abr', ventas: 181000000, comisiones: 9050000, vehículos: 58, sucursales: 5 },
  { month: 'May', ventas: 165000000, comisiones: 8250000, vehículos: 48, sucursales: 5 },
];

const mockCompanyStats = [
  { name: 'Vehículos Activos', value: 198, color: '#6366f1' },
  { name: 'Subastas Completadas', value: 456, color: '#10b981' },
  { name: 'En Espera', value: 38, color: '#f59e0b' },
  { name: 'Canceladas', value: 24, color: '#ef4444' },
];

export default function CompanyAdminDashboard() {
  const [loading] = useState(false);

  // Placeholder stats
  const stats = [
    { label: 'Total Vehículos', value: '198', icon: Building2, change: '+8.3%', trend: 'up' },
    { label: 'Subastas Activas', value: '38', icon: TrendingUp, change: '+3.5%', trend: 'up' },
    { label: 'Ingresos este mes', value: COP(181000000), icon: DollarSign, change: '+9.2%', trend: 'up' },
    { label: 'Usuarios Totales', value: '127', icon: Users, change: '+5.6%', trend: 'up' },
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <Header />

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - Empresa</h1>
          <p className="text-gray-600 mt-2">Resumen consolidado de todas tus sucursales y actividad</p>
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
            <h3 className="text-lg font-semibold mb-4">Ventas por Mes (Consolidado)</h3>
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
                  data={mockCompanyStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockCompanyStats.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bar Chart - Vehicles per Month */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Vehículos Publicados por Mes (Total Empresa)</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Comisiones Este Mes</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">{COP(mockMonthlyData[3].comisiones)}</p>
            <p className="text-sm text-gray-600">Total consolidado de todas las sucursales</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Sucursales Activas</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">5</p>
            <p className="text-sm text-gray-600">Operando correctamente</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-3">Desempeño Mensual</h3>
            <p className="text-gray-600 text-sm mb-2">✓ 58 vehículos este mes</p>
            <p className="text-gray-600 text-sm mb-2">✓ Tasa promedio: 82%</p>
            <p className="text-gray-600 text-sm">✓ Crecimiento: +15.2%</p>
          </Card>
        </div>

        {/* Branches Overview */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Desempeño por Sucursal</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Sucursal</th>
                  <th className="text-right py-2 px-2">Vehículos</th>
                  <th className="text-right py-2 px-2">Ventas</th>
                  <th className="text-right py-2 px-2">Usuarios</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Bogotá Centro', vehicles: 48, sales: 145000000, users: 32, status: 'Activa' },
                  { name: 'Bogotá Sur', vehicles: 38, sales: 98000000, users: 24, status: 'Activa' },
                  { name: 'Medellín', vehicles: 42, sales: 125000000, users: 28, status: 'Activa' },
                  { name: 'Cali', vehicles: 38, sales: 115000000, users: 22, status: 'Activa' },
                  { name: 'Barranquilla', vehicles: 32, sales: 88000000, users: 21, status: 'Activa' },
                ].map((branch, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{branch.name}</td>
                    <td className="text-right py-3 px-2">{branch.vehicles}</td>
                    <td className="text-right py-3 px-2">{COP(branch.sales)}</td>
                    <td className="text-right py-3 px-2">{branch.users}</td>
                    <td className="text-right py-3 px-2">
                      <Badge variant="default" className="bg-green-600">Activa</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AdminNavbar 
        dashboardPath="/CompanyAdminDashboard"
        usersPath="/CompanyAdminUsuarios"
        role="company_admin"
      />
    </div>
  );
}
