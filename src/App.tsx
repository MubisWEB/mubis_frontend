import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RequireAuth, RequireRole } from "@/components/RequireAuth";
import { AuthProvider } from "@/lib/AuthContext";
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
import RecuperarContrasena from './pages/RecuperarContrasena';
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
import HistorialPeritajes from './pages/HistorialPeritajes';
import HistorialPeritajeDetalle from './pages/HistorialPeritajeDetalle';
import SoporteCasos, { SoporteCasoDetalle } from './pages/SoporteCasos';
import AdminCasos, { AdminCasoDetalle } from './pages/AdminCasos';
import AdminInventario from './pages/AdminInventario';
import AdminMetas from './pages/AdminMetas';
import AdminSucursales from './pages/AdminSucursales';
import MiRendimiento from './pages/MiRendimiento';
import MisMetas from './pages/MisMetas';
import SeBusca from './pages/SeBusca';
import B2BCatalogo from './pages/B2BCatalogo';
import MisOfertas from './pages/MisOfertas';
import SetPassword from './pages/SetPassword';
import AdminEmpresas from './pages/AdminEmpresas';
import AdminCargaMasiva from './pages/AdminCargaMasiva';
import AdminGeneralDashboard from './pages/AdminGeneralDashboard';
import AdminSucursalDashboard from './pages/AdminSucursalDashboard';
import AdminBanners from './pages/AdminBanners';
import Partners from './pages/Partners';
import AdminPartners from './pages/AdminPartners';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
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
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro-confirmacion" element={<RegistroConfirmacion />} />
          <Route path="/PendienteVerificacion" element={<PendienteVerificacion />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Comprar: dealer + recomprador + admin_general + admin_sucursal */}
          <Route path="/Comprar" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><Comprar /></RequireRole>} />
          <Route path="/DetalleSubasta/:auctionId" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><DetalleSubasta /></RequireRole>} />
          <Route path="/Ganados" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><Ganados /></RequireRole>} />
          <Route path="/Guardadas" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><Guardadas /></RequireRole>} />

          {/* Vender: dealer + admin_general + admin_sucursal */}
          <Route path="/MisSubastas" element={<RequireRole roles={['dealer','admin_general','admin_sucursal']}><MisSubastas /></RequireRole>} />
          <Route path="/DetalleSubastaVendedor/:auctionId" element={<RequireRole roles={['dealer','admin_general','admin_sucursal']}><DetalleSubastaVendedor /></RequireRole>} />

          {/* Se Busca: dealer + admin_general + admin_sucursal */}
          <Route path="/SeBusca" element={<RequireRole roles={['dealer','admin_general','admin_sucursal']}><SeBusca /></RequireRole>} />

          {/* Movimientos: dealer + recomprador + admin_general + admin_sucursal */}
          <Route path="/Movimientos" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><Movimientos /></RequireRole>} />

          {/* Cuenta: all authenticated */}
          <Route path="/Cuenta" element={<RequireAuth><Cuenta /></RequireAuth>} />
          <Route path="/Notificaciones" element={<RequireAuth><Notificaciones /></RequireAuth>} />
          <Route path="/Configuracion" element={<RequireAuth><Configuracion /></RequireAuth>} />
          <Route path="/AyudaSoporte" element={<RequireAuth><AyudaSoporte /></RequireAuth>} />
          <Route path="/SoporteCasos" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><SoporteCasos /></RequireRole>} />
          <Route path="/SoporteCasos/:caseId" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><SoporteCasoDetalle /></RequireRole>} />
          <Route path="/Partners" element={<RequireRole roles={['dealer','recomprador','admin_general','admin_sucursal']}><Partners /></RequireRole>} />

          {/* Perito */}
          <Route path="/PeritajesPendientes" element={<RequireRole roles={['perito']}><PeritajesPendientes /></RequireRole>} />
          <Route path="/HistorialPeritajes" element={<RequireRole roles={['perito']}><HistorialPeritajes /></RequireRole>} />
          <Route path="/PeritajeDetalle/:vehicleId" element={<RequireRole roles={['perito','dealer']}><PeritajeDetalle /></RequireRole>} />
          <Route path="/HistorialPeritajeDetalle/:vehicleId" element={<RequireRole roles={['perito']}><HistorialPeritajeDetalle /></RequireRole>} />

          {/* Admin — Superadmin exclusivo */}
          <Route path="/AdminDashboard" element={<RequireRole roles={['superadmin']}><AdminDashboard /></RequireRole>} />
          <Route path="/AdminDealers" element={<RequireRole roles={['superadmin']}><AdminDealers /></RequireRole>} />
          <Route path="/AdminDealerDetalle/:userId" element={<RequireRole roles={['superadmin']}><AdminDealerDetalle /></RequireRole>} />
          <Route path="/AdminCasos" element={<RequireRole roles={['superadmin']}><AdminCasos /></RequireRole>} />
          <Route path="/AdminCasos/:caseId" element={<RequireRole roles={['superadmin']}><AdminCasoDetalle /></RequireRole>} />
          <Route path="/AdminInventario" element={<RequireRole roles={['superadmin']}><AdminInventario /></RequireRole>} />
          <Route path="/AdminMetas" element={<RequireRole roles={['superadmin']}><AdminMetas /></RequireRole>} />
          <Route path="/AdminEmpresas" element={<RequireRole roles={['superadmin']}><AdminEmpresas /></RequireRole>} />
          <Route path="/AdminCargaMasiva" element={<RequireRole roles={['superadmin']}><AdminCargaMasiva /></RequireRole>} />
          <Route path="/AdminBanners" element={<RequireRole roles={['superadmin']}><AdminBanners /></RequireRole>} />
          <Route path="/AdminPartners" element={<RequireRole roles={['superadmin']}><AdminPartners /></RequireRole>} />

          {/* Admin — Compartido: superadmin + admin_general + admin_sucursal */}
          <Route path="/AdminSolicitudes" element={<RequireRole roles={['superadmin','admin_general','admin_sucursal']}><AdminSolicitudes /></RequireRole>} />
          <Route path="/AdminSubastas" element={<RequireRole roles={['superadmin','admin_general','admin_sucursal']}><AdminSubastas /></RequireRole>} />
          <Route path="/AdminMovimientos" element={<RequireRole roles={['superadmin','admin_general','admin_sucursal']}><AdminMovimientos /></RequireRole>} />
          <Route path="/AdminAnaliticas" element={<RequireRole roles={['superadmin','admin_general','admin_sucursal']}><AdminAnaliticas /></RequireRole>} />
          <Route path="/AdminSucursales" element={<RequireRole roles={['superadmin','admin_general']}><AdminSucursales /></RequireRole>} />

          {/* Admin — Nuevos roles */}
          <Route path="/AdminGeneralDashboard" element={<RequireRole roles={['admin_general','superadmin']}><AdminGeneralDashboard /></RequireRole>} />
          <Route path="/AdminSucursalDashboard" element={<RequireRole roles={['admin_sucursal','admin_general','superadmin']}><AdminSucursalDashboard /></RequireRole>} />

          {/* Dealer */}
          <Route path="/MiRendimiento" element={<RequireRole roles={['dealer']}><MiRendimiento /></RequireRole>} />
          <Route path="/MisMetas" element={<RequireRole roles={['dealer']}><MisMetas /></RequireRole>} />

          {/* Recomprador */}
          <Route path="/B2BCatalogo" element={<RequireRole roles={['recomprador']}><B2BCatalogo /></RequireRole>} />
          <Route path="/MisOfertas" element={<RequireRole roles={['recomprador']}><MisOfertas /></RequireRole>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

