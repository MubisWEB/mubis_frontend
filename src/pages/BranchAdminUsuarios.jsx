import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, UserCheck, Search } from 'lucide-react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

// Mock users data
const mockUsers = [
  {
    id: 1,
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    telefono: '+57 310 123 4567',
    rol: 'dealer',
    estado: 'activo',
    fechaRegistro: '2024-01-15',
    vehículos: 12,
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria.garcia@example.com',
    telefono: '+57 312 456 7890',
    rol: 'dealer',
    estado: 'activo',
    fechaRegistro: '2024-02-20',
    vehículos: 8,
  },
  {
    id: 3,
    nombre: 'Juan Martínez',
    email: 'juan.martinez@example.com',
    telefono: '+57 314 789 0123',
    rol: 'perito',
    estado: 'activo',
    fechaRegistro: '2024-03-10',
    vehículos: 0,
  },
  {
    id: 4,
    nombre: 'Ana López',
    email: 'ana.lopez@example.com',
    telefono: '+57 316 234 5678',
    rol: 'dealer',
    estado: 'inactivo',
    fechaRegistro: '2024-01-05',
    vehículos: 5,
  },
  {
    id: 5,
    nombre: 'Pedro Sánchez',
    email: 'pedro.sanchez@example.com',
    telefono: '+57 318 567 8901',
    rol: 'recomprador',
    estado: 'activo',
    fechaRegistro: '2024-04-12',
    vehículos: 0,
  },
];

const roleLabels = {
  dealer: 'Distribuidor',
  perito: 'Perito',
  recomprador: 'Recomprador',
  branch_admin: 'Admin Sucursal',
};

const roleColors = {
  dealer: 'bg-blue-50 text-blue-700 border-blue-200',
  perito: 'bg-purple-50 text-purple-700 border-purple-200',
  recomprador: 'bg-green-50 text-green-700 border-green-200',
  branch_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function BranchAdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'todos' || user.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <Header />

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Usuarios de la Sucursal</h1>
          <p className="text-gray-600 mt-2">Gestiona y visualiza los usuarios asociados a tu sucursal</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos los roles</option>
              <option value="dealer">Distribuidor</option>
              <option value="perito">Perito</option>
              <option value="recomprador">Recomprador</option>
            </select>
          </div>
        </div>

        {/* Users Count */}
        <div className="mb-4 text-sm text-gray-600">
          Mostrando <span className="font-semibold">{filteredUsers.length}</span> de{' '}
          <span className="font-semibold">{mockUsers.length}</span> usuarios
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left side - User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{user.nombre}</h3>
                      <Badge
                        className={`${roleColors[user.rol]} border`}
                        variant="outline"
                      >
                        {roleLabels[user.rol]}
                      </Badge>
                      <Badge
                        variant={user.estado === 'activo' ? 'default' : 'secondary'}
                      >
                        {user.estado === 'activo' ? '🟢 Activo' : '🔴 Inactivo'}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${user.email}`} className="hover:text-indigo-600">
                          {user.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${user.telefono}`} className="hover:text-indigo-600">
                          {user.telefono}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Registrado: {new Date(user.fechaRegistro).toLocaleDateString('es-CO')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Stats & Action */}
                  <div className="flex flex-col items-start md:items-end gap-3">
                    {user.rol === 'dealer' && (
                      <div className="bg-blue-50 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-600">Vehículos publicados</p>
                        <p className="text-2xl font-bold text-blue-600">{user.vehículos}</p>
                      </div>
                    )}
                    {user.rol !== 'dealer' && (
                      <div className="bg-gray-100 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-600">Status</p>
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                          <UserCheck className="w-4 h-4" /> Verificado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No se encontraron usuarios con los criterios de búsqueda.</p>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
