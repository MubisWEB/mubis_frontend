import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { subscriptionsApi } from '../lib/subscriptionsApi';

const PLAN_FEATURES = [
  'Acceso a todas las subastas verificadas',
  'Inventario profesional centralizado',
  'Compra rápida con seguimiento de negocios',
  'Chat directo con vendedores',
  'Se Busca y Deseados',
  'Catálogo B2B mayorista',
  'Historial de negocios ganados',
];

function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Suscripcion() {
  const { user, isSubscriptionActive } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    subscriptionsApi.getPlans().then(setPlans).catch(() => {});
  }, []);

  const isExpired =
    user?.subscriptionStatus === 'EXPIRED' ||
    user?.subscriptionStatus === 'GRACE_PERIOD' ||
    user?.subscriptionStatus === 'CANCELLED';

  async function handleSubscribe() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const { checkoutUrl } = await subscriptionsApi.createCheckout(selected);
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e.message ?? 'Error al crear el checkout. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const planLabels = { MONTHLY: '1 mes', BIANNUAL: '6 meses', ANNUAL: '12 meses' };
  const planBadge = { MONTHLY: null, BIANNUAL: 'Ahorra 5%', ANNUAL: 'Ahorra 12%' };
  const selectedPlan = plans.find((p) => p.id === selected);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          {isExpired ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Renueva tu suscripción</h1>
              <p className="text-gray-500">
                Tu suscripción venció. Elige un plan para volver a operar en Mubis.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Elige tu plan Mubis</h1>
              <p className="text-gray-500">
                Accede a subastas verificadas y oportunidades de compra profesionales.
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isSelected = selected === plan.id;
            const badge = planBadge[plan.id];
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative rounded-2xl border-2 p-6 text-left transition-all cursor-pointer w-full ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                }`}
              >
                {badge && (
                  <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {badge}
                  </span>
                )}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {planLabels[plan.id]}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCOP(plan.totalCOP)}
                  </p>
                  {plan.savingsCOP > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Ahorra {formatCOP(plan.savingsCOP)} vs mensual
                    </p>
                  )}
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Incluye en todos los planes:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleSubscribe}
            disabled={!selected || loading}
            className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
          >
            {loading
              ? 'Redirigiendo a pago...'
              : selected
              ? `Suscribirme — ${formatCOP(selectedPlan?.totalCOP ?? 0)}`
              : 'Selecciona un plan'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
