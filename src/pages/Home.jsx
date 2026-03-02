import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Car, DollarSign, Clock, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TopBar from "@/components/TopBar";

export default function Home() {
  const navigate = useNavigate();
  const [plate, setPlate] = useState('');
  const [stats, setStats] = useState({ dealers: 213, sold: 1847, avg: 48 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({ dealers: 213, sold: prev.sold + Math.floor(Math.random() * 3), avg: prev.avg }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: Car, title: 'Inspección', desc: 'Gratuita en Concesionarios Certificados', color: 'bg-secondary' },
    { icon: Zap, title: 'Subasta', desc: 'Dealers compiten por tu carro', color: 'bg-secondary' },
    { icon: DollarSign, title: 'Pago', desc: 'En menos de 48 horas*', color: 'bg-primary' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar />
      <div className="relative overflow-hidden bg-gradient-brand">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative px-5 pt-8 pb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <MubisLogo size="xl" variant="light" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
            <h1 className="text-3xl text-white mb-2 leading-tight font-serif font-bold tracking-tight">Vende tu carro<br />en 48 horas*</h1>
            <p className="text-white/70 text-base mb-6 font-normal tracking-wide">Concesionarios Compiten, Tú Ganas</p>
            <div className="max-w-sm mx-auto">
              <div className="flex gap-2 bg-white/10 backdrop-blur-lg rounded-2xl p-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Placa de tu Carro" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} className="pl-10 h-12 rounded-xl border-0 bg-card text-foreground font-semibold placeholder:text-muted-foreground" />
                </div>
                <Button onClick={() => navigate(createPageUrl('VenderInicio'))} className="h-12 px-5 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full font-bold">Empezar</Button>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center gap-4 mt-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-center flex-1 max-w-[100px]">
                  <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-xs font-semibold">{step.title}</p>
                  <p className="text-white/50 text-[10px] leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="bg-card rounded-t-[2rem] -mt-4 pt-6 pb-24 px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-secondary/10 rounded-2xl">
            <p className="text-2xl font-bold text-secondary">{stats.dealers}+</p>
            <p className="text-muted-foreground text-[10px] leading-tight">Concesionarios Certificados</p>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-2xl">
            <p className="text-2xl font-bold text-primary">{stats.sold}</p>
            <p className="text-muted-foreground text-xs">Carros vendidos</p>
          </div>
          <div className="text-center p-3 bg-secondary/5 rounded-2xl">
            <p className="text-2xl font-bold text-secondary">{stats.avg}h</p>
            <p className="text-muted-foreground text-xs">Tiempo promedio</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6">
          <h2 className="text-lg text-foreground mb-3 font-serif font-bold tracking-tight">¿Por qué Mubis?</h2>
          <div className="space-y-2">
            {[
              { icon: Shield, text: 'Sin intermediarios, vende directo', color: 'text-secondary bg-secondary/10' },
              { icon: CheckCircle, text: 'Inspección profesional gratuita', color: 'text-primary bg-primary/10' },
              { icon: DollarSign, text: 'Pago seguro y garantizado', color: 'text-secondary bg-secondary/10' },
              { icon: Clock, text: 'Trámites de traspaso incluidos', color: 'text-primary bg-primary/10' }
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${benefit.color.split(' ')[1]}`}>
                    <Icon className={`w-5 h-5 ${benefit.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-foreground/80 font-medium text-sm">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <BottomNav currentPage="Home" />
    </div>
  );
}
