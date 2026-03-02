import AdminDealerDetalle from './pages/AdminDealerDetalle';
import AdminDealers from './pages/AdminDealers';
import AdminSolicitudes from './pages/AdminSolicitudes';
import Autenticacion from './pages/Autenticacion';
import CarrosVendidos from './pages/CarrosVendidos';
import DetalleSubasta from './pages/DetalleSubasta';
import Ganados from './pages/Ganados';
import ListaDeseos from './pages/ListaDeseos';
import PerfilDealer from './pages/PerfilDealer';
import Registro from './pages/Registro';
import RegistroDealer from './pages/RegistroDealer';
import RegistroVendedor from './pages/RegistroVendedor';
import Subastas from './pages/Subastas';
import VerificarCodigo from './pages/VerificarCodigo';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cuenta from './pages/Cuenta';
import AdminDashboard from './pages/AdminDashboard';
import DetalleSubastaVendedor from './pages/DetalleSubastaVendedor';
import Home from './pages/Home';
import MisSubastas from './pages/MisSubastas';
import VenderInicio from './pages/VenderInicio';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    // Public pages (no layout)
    "Landing": Landing,
    "login": Login,
    "registro": Registro,
    
    // App pages
    "AdminDealerDetalle": AdminDealerDetalle,
    "AdminDealers": AdminDealers,
    "AdminSolicitudes": AdminSolicitudes,
    "Autenticacion": Autenticacion,
    "CarrosVendidos": CarrosVendidos,
    "DetalleSubasta": DetalleSubasta,
    "Ganados": Ganados,
    "ListaDeseos": ListaDeseos,
    "PerfilDealer": PerfilDealer,
    "RegistroDealer": RegistroDealer,
    "RegistroVendedor": RegistroVendedor,
    "Subastas": Subastas,
    "VerificarCodigo": VerificarCodigo,
    "Wallet": Wallet,
    "Dashboard": Dashboard,
    "Cuenta": Cuenta,
    "AdminDashboard": AdminDashboard,
    "DetalleSubastaVendedor": DetalleSubastaVendedor,
    "Home": Home,
    "MisSubastas": MisSubastas,
    "VenderInicio": VenderInicio,
}

// Pages that should NOT use the layout (public pages)
export const PUBLIC_PAGES = ["Landing", "login", "registro"];

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
    publicPages: PUBLIC_PAGES,
};
