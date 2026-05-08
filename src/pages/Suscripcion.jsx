import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Star, Lock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { subscriptionsApi } from '../lib/subscriptionsApi';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';

// ─── Plan metadata ────────────────────────────────────────────────────────────
const PLAN_META = {
  MONTHLY: {
    label: '1 mes',
    sublabel: 'Prueba sin compromiso',
    Icon: Zap,
    featured: false,
    savingLabel: null,
    monthlyDivisor: 1,
    mobileOrder: 'order-3',
  },
  BIANNUAL: {
    label: '6 meses',
    sublabel: 'Para compradores frecuentes',
    Icon: Shield,
    featured: false,
    savingLabel: 'Ahorra 5%',
    monthlyDivisor: 6,
    mobileOrder: 'order-2',
  },
  ANNUAL: {
    label: '12 meses',
    sublabel: 'La opción profesional',
    Icon: Star,
    featured: true,
    savingLabel: 'Más popular · Ahorra 12%',
    monthlyDivisor: 12,
    mobileOrder: 'order-1',
  },
};

const FEATURES = [
  'Acceso a todas las subastas verificadas',
  'Inventario profesional centralizado',
  'Compra rápida con seguimiento de negocios',
  'Chat directo con vendedores',
  'Se Busca y Deseados',
  'Catálogo B2B mayorista',
  'Historial de negocios ganados',
];

const TRUST_ITEMS = [
  { icon: Lock,     text: 'Pago 100% seguro con Wompi' },
  { icon: Shield,   text: 'Cancela cuando quieras'      },
  { icon: Sparkles, text: 'Acceso inmediato al activar'  },
];

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, meta, onSelect, loading, wrapperClass }) {
  const monthlyEquiv = plan.totalCOP / meta.monthlyDivisor;
  const showMonthly  = meta.monthlyDivisor > 1;

  return (
    <div className={wrapperClass}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: meta.featured ? 0.05 : 0.15 }}
        className={`relative flex flex-col rounded-3xl overflow-hidden h-full transition-all duration-300 ${
          meta.featured
            ? 'shadow-2xl ring-2 ring-secondary md:-mt-4 md:scale-[1.04]'
            : 'shadow-md hover:shadow-xl border border-border'
        }`}
      >
        {/* Background */}
        {meta.featured ? (
          <div className="absolute inset-0" style={{ background: 'var(--gradient-purple)' }} />
        ) : (
          <div className="absolute inset-0 bg-card" />
        )}

        <div className="relative flex flex-col h-full p-6 sm:p-7">
          {/* Badge */}
          {meta.savingLabel && (
            <div className={`self-start mb-4 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
              meta.featured ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
            }`}>
              {meta.savingLabel}
            </div>
          )}

          {/* Icon + name */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              meta.featured ? 'bg-white/20' : 'bg-secondary/10'
            }`}>
              <meta.Icon className={`w-5 h-5 ${meta.featured ? 'text-white' : 'text-secondary'}`} />
            </div>
            <div>
              <p className={`font-bold text-lg leading-tight ${meta.featured ? 'text-white' : 'text-foreground'}`}>
                {meta.label}
              </p>
              <p className={`text-xs ${meta.featured ? 'text-white/70' : 'text-muted-foreground'}`}>
                {meta.sublabel}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className={`text-4xl font-black leading-none ${meta.featured ? 'text-white' : 'text-foreground'}`}>
              {formatCOP(plan.totalCOP)}
            </span>
            {showMonthly && (
              <p className={`text-sm mt-1 ${meta.featured ? 'text-white/70' : 'text-muted-foreground'}`}>
                ≈ {formatCOP(monthlyEquiv)} / mes
              </p>
            )}
            {plan.savingsCOP > 0 && (
              <p className={`text-xs mt-1 font-medium ${meta.featured ? 'text-white/80' : 'text-primary'}`}>
                Ahorras {formatCOP(plan.savingsCOP)} vs mensual
              </p>
            )}
          </div>

          {/* Divider */}
          <div className={`h-px mb-5 ${meta.featured ? 'bg-white/20' : 'bg-border'}`} />

          {/* Features */}
          <ul className="flex-1 space-y-2.5 mb-7">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.featured ? 'text-white' : 'text-primary'}`} />
                <span className={`text-sm ${meta.featured ? 'text-white/90' : 'text-muted-foreground'}`}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => onSelect(plan.id)}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation ${
              meta.featured
                ? 'bg-white text-secondary hover:bg-white/90 shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin`} />
                Redirigiendo...
              </span>
            ) : (
              <>
                Suscribirme
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ featured, wrapperClass }) {
  return (
    <div className={wrapperClass}>
      <div className={`rounded-3xl border border-border p-6 sm:p-7 animate-pulse bg-card ${
        featured ? 'md:-mt-4' : ''
      }`}>
        <div className="h-5 bg-muted rounded-full w-24 mb-4" />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-muted rounded-2xl" />
          <div>
            <div className="h-4 bg-muted rounded w-16 mb-1.5" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        </div>
        <div className="h-10 bg-muted rounded w-36 mb-2" />
        <div className="h-3 bg-muted rounded w-28 mb-6" />
        <div className="space-y-2.5 mb-7">
          {FEATURES.map((_, i) => (
            <div key={i} className="h-3 bg-muted rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
        <div className="h-13 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PLAN_ORDER = ['MONTHLY', 'BIANNUAL', 'ANNUAL'];

export default function Suscripcion() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [plans, setPlans]               = useState([]);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [fetchError, setFetchError]     = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const isExpired =
    user?.subscriptionStatus === 'EXPIRED' ||
    user?.subscriptionStatus === 'GRACE_PERIOD' ||
    user?.subscriptionStatus === 'CANCELLED';

  useEffect(() => {
    subscriptionsApi.getPlans().then(setPlans).catch(() => setFetchError(true));
  }, []);

  async function handleSelect(planId) {
    setLoadingPlanId(planId);
    setCheckoutError(null);
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (e) {
      const message = e.message ?? '';
      setCheckoutError(
        /wompi/i.test(message)
          ? 'Los planes ya están listos. Falta activar Wompi para poder cobrar suscripciones.'
          : message || 'Error al crear el checkout. Intenta de nuevo.',
      );
      setLoadingPlanId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar />

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden pt-12 pb-16 px-4 text-center"
        style={{ background: 'var(--gradient-purple)' }}
      >
        {/* Decorative blobs — rendered first so they sit behind the button */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Back arrow — z-10 keeps it above the blobs */}
        <button
          onClick={() => navigate('/Comprar')}
          className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center transition-colors touch-manipulation"
          aria-label="Volver a subastas"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-semibold tracking-widest uppercase">
            {isExpired ? 'Renueva tu plan' : 'Acceso profesional'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            {isExpired ? 'Reactiva tu cuenta Mubis' : 'Elige tu plan Mubis'}
          </h1>
          <p className="text-white/75 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {isExpired
              ? 'Tu suscripción venció. Reactiva para volver a operar.'
              : 'Accede a subastas verificadas, inventario mayorista y negocios directos.'}
          </p>
        </motion.div>
      </div>

      {/* ── Plans ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 mb-10">
        {fetchError ? (
          <div className="mt-12 text-center">
            <p className="text-destructive font-medium mb-3">No se pudieron cargar los planes.</p>
            <button
              onClick={() => {
                setFetchError(false);
                subscriptionsApi.getPlans().then(setPlans).catch(() => setFetchError(true));
              }}
              className="text-sm text-secondary underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        ) : (
          /* On mobile: flex-col with ANNUAL first via order classes.
             On desktop: 3-col grid in original order. */
          <div className="flex flex-col md:grid md:grid-cols-3 gap-5 md:items-start">
            {plans.length === 0
              ? PLAN_ORDER.map((id, i) => (
                  <SkeletonCard
                    key={id}
                    featured={i === 2}
                    wrapperClass={PLAN_META[id].mobileOrder + ' md:order-none'}
                  />
                ))
              : PLAN_ORDER.map((id) => {
                  const plan = plans.find((p) => p.id === id);
                  if (!plan) return null;
                  return (
                    <PlanCard
                      key={id}
                      plan={plan}
                      meta={PLAN_META[id]}
                      onSelect={handleSelect}
                      loading={loadingPlanId === id}
                      wrapperClass={PLAN_META[id].mobileOrder + ' md:order-none'}
                    />
                  );
                })}
          </div>
        )}

        {checkoutError && (
          <p className="mt-5 text-center text-sm text-destructive">{checkoutError}</p>
        )}
      </div>

      {/* ── Trust bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="max-w-3xl mx-auto px-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
