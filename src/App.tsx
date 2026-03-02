import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import AdminDealerDetalle from './pages/AdminDealerDetalle';
import AdminDealers from './pages/AdminDealers';
import AdminSolicitudes from './pages/AdminSolicitudes';
import Autenticacion from './pages/Autenticacion';
import CarrosVendidos from './pages/CarrosVendidos';
import DetalleSubasta from './pages/DetalleSubasta';
import Ganados from './pages/Ganados';
import Comprar from './pages/Comprar';
import VerificarCodigo from './pages/VerificarCodigo';
import Movimientos from './pages/Movimientos';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RegistroConfirmacion from './pages/RegistroConfirmacion';
import Dashboard from './pages/Dashboard';
import Cuenta from './pages/Cuenta';
import AdminDashboard from './pages/AdminDashboard';
import DetalleSubastaVendedor from './pages/DetalleSubastaVendedor';
import Home from './pages/Home';
import MisSubastas from './pages/MisSubastas';
import VenderInicio from './pages/VenderInicio';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages */}  
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro-confirmacion" element={<RegistroConfirmacion />} />

          {/* App pages */}
          
          <Route path="/Comprar" element={<Comprar />} />
          <Route path="/DetalleSubasta" element={<DetalleSubasta />} />
          <Route path="/MisSubastas" element={<MisSubastas />} />
          

          {/* Vendedor */}
          <Route path="/Home" element={<Home />} />*/
          <Route path="/DetalleSubastaVendedor" element={<DetalleSubastaVendedor />} />
          <Route path="/VenderInicio" element={<VenderInicio />} />



          <Route path="/Movimientos" element={<Movimientos />} />
          <Route path="/Cuenta" element={<Cuenta />} />
          <Route path="/Dashboard" element={<Dashboard />} />

          {/* Admin */}
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/AdminDealers" element={<AdminDealers />} />
          <Route path="/AdminDealerDetalle" element={<AdminDealerDetalle />} />
          <Route path="/AdminSolicitudes" element={<AdminSolicitudes />} />

          <Route path="/CarrosVendidos" element={<CarrosVendidos />} />
          <Route path="/Ganados" element={<Ganados />} />
          <Route path="/Autenticacion" element={<Autenticacion />} />
          <Route path="/VerificarCodigo" element={<VerificarCodigo />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
