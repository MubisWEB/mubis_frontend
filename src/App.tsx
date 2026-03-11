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
import ComoFunciona from './pages/ComoFunciona';
import ParaDealers from './pages/ParaDealers';
import Contacto from './pages/Contacto';
import TerminosCondiciones from './pages/TerminosCondiciones';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import AvisoLegal from './pages/AvisoLegal';
import PreguntasFrecuentes from './pages/PreguntasFrecuentes';
import Comprar from './pages/Comprar';
import DetalleSubasta from './pages/DetalleSubasta';
import MisSubastas from './pages/MisSubastas';
import DetalleSubastaVendedor from './pages/DetalleSubastaVendedor';
import Movimientos from './pages/Movimientos';
import Cuenta from './pages/Cuenta';
import Notificaciones from './pages/Notificaciones';
import Configuracion from './pages/Configuracion';
import AyudaSoporte from './pages/AyudaSoporte';
import Ganados from './pages/Ganados';
import Guardadas from './pages/Guardadas';
import AdminDashboard from './pages/AdminDashboard';
import AdminDealers from './pages/AdminDealers';
import AdminDealerDetalle from './pages/AdminDealerDetalle';
import AdminSolicitudes from './pages/AdminSolicitudes';
import AdminSubastas from './pages/AdminSubastas';
import AdminMovimientos from './pages/AdminMovimientos';
import AdminAnaliticas from './pages/AdminAnaliticas';
import PeritajesPendientes from './pages/PeritajesPendientes';
import PeritajeDetalle from './pages/PeritajeDetalle';
import SoporteCasos, { SoporteCasoDetalle } from './pages/SoporteCasos';
import AdminCasos, { AdminCasoDetalle } from './pages/AdminCasos';

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
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/para-dealers" element={<ParaDealers />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro-confirmacion" element={<RegistroConfirmacion />} />
          <Route path="/PendienteVerificacion" element={<PendienteVerificacion />} />

          {/* Comprar: dealer + recomprador */}
          <Route path="/Comprar" element={<RequireRole roles={['dealer','recomprador']}><Comprar /></RequireRole>} />
          <Route path="/DetalleSubasta/:auctionId" element={<RequireRole roles={['dealer','recomprador']}><DetalleSubasta /></RequireRole>} />
          <Route path="/Ganados" element={<RequireRole roles={['dealer','recomprador']}><Ganados /></RequireRole>} />
          <Route path="/Guardadas" element={<RequireRole roles={['dealer','recomprador']}><Guardadas /></RequireRole>} />

          {/* Vender: dealer only */}
          <Route path="/MisSubastas" element={<RequireRole roles={['dealer']}><MisSubastas /></RequireRole>} />
          <Route path="/DetalleSubastaVendedor/:auctionId" element={<RequireRole roles={['dealer']}><DetalleSubastaVendedor /></RequireRole>} />

          {/* Movimientos: dealer + recomprador */}
          <Route path="/Movimientos" element={<RequireRole roles={['dealer','recomprador']}><Movimientos /></RequireRole>} />

          {/* Cuenta: all authenticated */}
          <Route path="/Cuenta" element={<RequireAuth><Cuenta /></RequireAuth>} />
          <Route path="/Configuracion" element={<RequireAuth><Configuracion /></RequireAuth>} />
          <Route path="/AyudaSoporte" element={<RequireAuth><AyudaSoporte /></RequireAuth>} />
          <Route path="/SoporteCasos" element={<RequireRole roles={['dealer','recomprador']}><SoporteCasos /></RequireRole>} />
          <Route path="/SoporteCasos/:caseId" element={<RequireRole roles={['dealer','recomprador']}><SoporteCasoDetalle /></RequireRole>} />

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
          <Route path="/AdminCasos" element={<RequireRole roles={['admin']}><AdminCasos /></RequireRole>} />
          <Route path="/AdminCasos/:caseId" element={<RequireRole roles={['admin']}><AdminCasoDetalle /></RequireRole>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
