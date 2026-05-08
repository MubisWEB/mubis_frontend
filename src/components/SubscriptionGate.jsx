import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function SubscriptionGate({ children }) {
  const { user, isSubscriptionActive } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'recomprador') return children;
  if (isSubscriptionActive) return children;

  const isGrace   = user.subscriptionStatus === 'GRACE_PERIOD';
  const isExpired =
    user.subscriptionStatus === 'EXPIRED' ||
    user.subscriptionStatus === 'GRACE_PERIOD' ||
    user.subscriptionStatus === 'CANCELLED';

  return (
    <div className="relative min-h-[60vh]">
      {/* Blurred content behind */}
      <div className="blur-sm pointer-events-none select-none opacity-50 overflow-hidden max-h-96" aria-hidden="true">
        {children}
      </div>

      {/* Overlay card */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
        <div className="bg-card rounded-2xl shadow-2xl border border-border max-w-sm w-full p-8 text-center">

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--gradient-purple)' }}
          >
            <Lock className="w-7 h-7 text-white" />
          </div>

          {isGrace ? (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2">Tu suscripción venció</h2>
              <p className="text-sm text-amber-600 font-medium mb-4">
                Tienes un negocio abierto. Renueva antes de que se cierre automáticamente.
              </p>
            </>
          ) : isExpired ? (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2">Tu suscripción venció</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Renueva para volver a ver y operar en la plataforma.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-2">Accede a Mubis con una suscripción</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Suscríbete para acceder a subastas verificadas y oportunidades de compra profesionales.
              </p>
            </>
          )}

          <ul className="text-sm text-muted-foreground text-left space-y-2 mb-6">
            {[
              'Acceso a subastas verificadas',
              'Inventario profesional centralizado',
              'Compra rápida y seguimiento de negocios',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate('/Suscripcion')}
            className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95"
            style={{ background: 'var(--gradient-purple)' }}
          >
            {isExpired ? 'Renueva tu suscripción' : 'Suscríbete a Mubis'}
          </button>
        </div>
      </div>
    </div>
  );
}
