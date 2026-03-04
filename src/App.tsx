import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth, RequireRole } from "@/components/RequireAuth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import Registro from './pages/Registro';
import RegistroConfirmacion from './pages/RegistroConfirmacion';
import PendienteVerificacion from './pages/PendienteVerificacion';
import Comprar from './pages/Comprar';
import DetalleSubasta from './pages/DetalleSubasta';
import MisSubastas from './pages/MisSubastas';
import DetalleSubastaVendedor from './pages/DetalleSubastaVendedor';
import Movimientos from './pages/Movimientos';
import Cuenta from './pages/Cuenta';
import Configuracion from './pages/Configuracion';
import Notificaciones from './pages/Notificaciones';
import Ganados from './pages/Ganados';
import AdminDashboard from './pages/AdminDashboard';
import AdminDealers from './pages/AdminDealers';
import AdminDealerDetalle from './pages/AdminDealerDetalle';
import AdminSolicitudes from './pages/AdminSolicitudes';
import AdminSubastas from './pages/AdminSubastas';
import AdminMovimientos from './pages/AdminMovimientos';
import AdminAnaliticas from './pages/AdminAnaliticas';
import PeritajesPendientes from './pages/PeritajesPendientes';
import PeritajeDetalle from './pages/PeritajeDetalle';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro-confirmacion" element={<RegistroConfirmacion />} />
          <Route path="/PendienteVerificacion" element={<PendienteVerificacion />} />

          {/* Comprar: dealer + recomprador */}
          <Route path="/Comprar" element={<RequireRole roles={['dealer','recomprador']}><Comprar /></RequireRole>} />
          <Route path="/DetalleSubasta/:auctionId" element={<RequireRole roles={['dealer','recomprador']}><DetalleSubasta /></RequireRole>} />
          <Route path="/Ganados" element={<RequireRole roles={['dealer','recomprador']}><Ganados /></RequireRole>} />

          {/* Vender: dealer only */}
          <Route path="/MisSubastas" element={<RequireRole roles={['dealer']}><MisSubastas /></RequireRole>} />
          <Route path="/DetalleSubastaVendedor/:auctionId" element={<RequireRole roles={['dealer']}><DetalleSubastaVendedor /></RequireRole>} />

          {/* Movimientos: dealer + recomprador */}
          <Route path="/Movimientos" element={<RequireRole roles={['dealer','recomprador']}><Movimientos /></RequireRole>} />

          {/* Cuenta: all authenticated */}
          <Route path="/Cuenta" element={<RequireAuth><Cuenta /></RequireAuth>} />
          <Route path="/Configuracion" element={<RequireAuth><Configuracion /></RequireAuth>} />
          <Route path="/Notificaciones" element={<RequireAuth><Notificaciones /></RequireAuth>} />

          {/* Perito */}
          <Route path="/PeritajesPendientes" element={<RequireRole roles={['perito']}><PeritajesPendientes /></RequireRole>} />
          <Route path="/PeritajeDetalle/:vehicleId" element={<RequireRole roles={['perito']}><PeritajeDetalle /></RequireRole>} />

          {/* Admin */}
          <Route path="/AdminDashboard" element={<RequireRole roles={['admin']}><AdminDashboard /></RequireRole>} />
          <Route path="/AdminDealers" element={<RequireRole roles={['admin']}><AdminDealers /></RequireRole>} />
          <Route path="/AdminDealerDetalle/:userId" element={<RequireRole roles={['admin']}><AdminDealerDetalle /></RequireRole>} />
          <Route path="/AdminSolicitudes" element={<RequireRole roles={['admin']}><AdminSolicitudes /></RequireRole>} />
          <Route path="/AdminSubastas" element={<RequireRole roles={['admin']}><AdminSubastas /></RequireRole>} />
          <Route path="/AdminMovimientos" element={<RequireRole roles={['admin']}><AdminMovimientos /></RequireRole>} />
          <Route path="/AdminAnaliticas" element={<RequireRole roles={['admin']}><AdminAnaliticas /></RequireRole>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
