import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Loader2, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { goalsApi } from '@/api/services';
import { toast } from 'sonner';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const PERIOD_LABELS = {
  MONTHLY: 'Mensual',
  QUARTERLY: 'Trimestral',
  ANNUAL: 'Anual',
};

function GoalBadge({ progress }) {
  if (progress === null || progress === undefined) return null;
  if (progress >= 100) return <Badge className="bg-green-100 text-green-800 border-0 text-xs">¡Meta cumplida!</Badge>;
  if (progress >= 50) return <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">En progreso</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-0 text-xs">Por debajo</Badge>;
}

function GoalCard({ goal, index }) {
  const rp = goal.progress?.revenueProgress;
  const cp = goal.progress?.countProgress;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}>
      <Card className="p-4 border border-border rounded-xl shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {PERIOD_LABELS[goal.periodType] || goal.periodType}
              </span>
              <span className="text-xs text-muted-foreground font-mono">{goal.period}</span>
            </div>
            {goal.description && (
              <p className="text-sm font-semibold text-foreground mt-1">{goal.description}</p>
            )}
          </div>
          <GoalBadge progress={rp ?? cp} />
        </div>

        {/* Revenue goal */}
        {goal.targetRevenue != null && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium text-foreground">
                {formatPrice(goal.progress?.actualRevenue || 0)} / {formatPrice(goal.targetRevenue)}
              </span>
            </div>
            <Progress value={Math.min(rp ?? 0, 100)} className="h-2" />
            <p className="text-right text-xs text-muted-foreground mt-0.5">{rp !== null ? `${rp}%` : '—'}</p>
          </div>
        )}

        {/* Count goal */}
        {goal.targetCount != null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Unidades vendidas</span>
              <span className="font-medium text-foreground">
                {goal.progress?.actualCount || 0} / {goal.targetCount}
              </span>
            </div>
            <Progress value={Math.min(cp ?? 0, 100)} className="h-2" />
            <p className="text-right text-xs text-muted-foreground mt-0.5">{cp !== null ? `${cp}%` : '—'}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function MisMetas() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const data = await goalsApi.getMine();
      setGoals(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al cargar las metas');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const cumplidas = goals.filter(g => (g.progress?.revenueProgress ?? g.progress?.countProgress ?? 0) >= 100).length;
  const enProgreso = goals.filter(g => {
    const p = g.progress?.revenueProgress ?? g.progress?.countProgress ?? 0;
    return p > 0 && p < 100;
  }).length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header title="Mis Metas" showBack />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-10 py-6 space-y-6">
        {/* Resumen */}
        {goals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-foreground font-mono">{goals.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </Card>
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-green-600 font-mono">{cumplidas}</p>
              <p className="text-xs text-muted-foreground">Cumplidas</p>
            </Card>
            <Card className="p-3 text-center border border-border rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-yellow-600 font-mono">{enProgreso}</p>
              <p className="text-xs text-muted-foreground">En progreso</p>
            </Card>
          </div>
        )}

        {/* Lista */}
        {goals.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-secondary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 font-sans">Sin metas asignadas</h3>
            <p className="text-muted-foreground text-sm">Cuando el administrador te asigne metas, aparecerán aquí.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {goals.map((g, i) => (
              <GoalCard key={g.id} goal={g} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
