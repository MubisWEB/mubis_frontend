import React from 'react';
import { Card } from "@/components/ui/card";
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import TopBar from "@/components/TopBar";

export default function AdminMovimientos() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />
      <nav className="w-full bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-16"><MubisLogo size="lg" /></div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-4 font-sans">Movimientos</h1>
        <Card className="p-8 text-center border border-border"><p className="text-muted-foreground">Módulo de movimientos próximamente disponible</p></Card>
      </div>
      <BottomNav />
    </div>
  );
}
