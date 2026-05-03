import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function SubscriptionGate({ children }) {
  const { user, isSubscriptionActive } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'recomprador') return children;
  if (isSubscriptionActive) return children;

  const isExpired =
    user.subscriptionStatus === 'EXPIRED' ||
    user.subscriptionStatus === 'GRACE_PERIOD' ||
    user.subscriptionStatus === 'CANCELLED';

  const isGrace = user.subscriptionStatus === 'GRACE_PERIOD';

  return (
    <div className="relative min-h-[60vh]">
      <div
        className="blur-sm pointer-events-none select-none opacity-50 overflow-hidden max-h-96"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {isGrace ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tu suscripcion vencio</h2>
              <p className="text-sm text-amber-600 font-medium mb-3">
                Tienes un negocio abierto. Renueva antes de que se cierre automaticamente.
              </p>
            </>
          ) : isExpired ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tu suscripcion vencio</h2>
              <p className="text-sm text-gray-500 mb-3">
                Renueva para volver a ver y operar en la plataforma.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Accede a Mubis con una suscripcion</h2>
              <p className="text-sm text-gray-500 mb-3">
                Suscribete para acceder a subastas verificadas y oportunidades de compra profesionales.
              </p>
            </>
          )}

          <ul className="text-sm text-gray-500 text-left space-y-1 mb-6">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Acceso a subastas verificadas</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Inventario profesional centralizado</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Compra rapida y seguimiento de negocios</li>
          </ul>

          <button
            onClick={() => navigate('/Suscripcion')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {isExpired ? 'Renueva tu suscripcion' : 'Suscribete a Mubis'}
          </button>
        </div>
      </div>
    </div>
  );
}
