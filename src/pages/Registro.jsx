import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import TopBar from "@/components/TopBar";
import MubisLogo from "@/components/MubisLogo";
import { authApi, branchesApi } from "@/api/services";

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [tenantSlug, setTenantSlug] = useState("");
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    authApi.getTenants().then((list) => {
      setTenants(list);
      if (list.length === 1) setTenantSlug(list[0].slug);
    }).catch(() => {});
    
    authApi.getCompanies().then((list) => {
      setCompanies(list);
    }).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    role: "",
    companyId: "",
    branch: "",
    nit: "",
    contacto: "",
    email: "",
    telefono: "",
    ciudad: "",
    branchId: "",
    address: "",
    password: "",
    password2: "",
    acepta: false,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // When city changes, load branches for that city
    if (field === 'ciudad' && value) {
      setLoadingBranches(true);
      branchesApi.getBranchesByCity(value, tenantSlug)
        .then((data) => {
          setBranches(data);
          // Reset branch selection when city changes
          setFormData((prev) => ({ ...prev, branchId: '', address: '' }));
        })
        .catch(() => {
          toast.error('Error al cargar sucursales');
          setBranches([]);
        })
        .finally(() => setLoadingBranches(false));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenantSlug) { toast.error("Selecciona una empresa"); return; }
    if (!formData.role) { toast.error("Selecciona tu tipo de cuenta"); return; }
    if (!formData.nit || !formData.contacto || !formData.email || !formData.telefono || !formData.ciudad || !formData.password || !formData.password2) {
      toast.error("Por favor completa todos los campos obligatorios"); return; }
    
    // Company validation for ALL roles
    if (!formData.companyId) {
      toast.error("Selecciona tu empresa o concesionario");
      return;
    }
    
    // Branch or address validation for ALL roles
    const isIndependent = formData.companyId === 'independiente';
    
    if (isIndependent && !formData.address) {
      toast.error("Ingresa tu dirección");
      return;
    }
    if (!isIndependent && !formData.branchId) {
      toast.error("Selecciona una sucursal");
      return;
    }
    
    if (formData.password.length < 8) { toast.error("La contraseña debe tener mínimo 8 caracteres"); return; }
    if (formData.password !== formData.password2) { toast.error("Las contraseñas no coinciden"); return; }
    if (!formData.acepta) { toast.error("Debes aceptar los términos y condiciones"); return; }

    setLoading(true);
    try {
      // Find company name from companies list
      const selectedCompany = companies.find(c => c.id === formData.companyId);
      
      await authApi.register({
        tenantSlug,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nombre: formData.contacto,
        company: selectedCompany?.name || '',
        branch: formData.branch,
        telefono: formData.telefono,
        ciudad: formData.ciudad,
        nit: formData.nit,
        branchId: isIndependent ? undefined : formData.branchId || undefined,
        address: formData.address || undefined,
      });
      toast.success("Solicitud enviada. Te contactaremos pronto.");
      navigate("/registro-confirmacion");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 rounded-xl border-border/70 bg-muted/20 px-4 text-sm focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:border-violet-500/40";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-muted/30">
      <TopBar />
      <nav className="w-full bg-background/80 backdrop-blur border-b border-border/60">
        <div className="flex items-center justify-center h-16">
          <MubisLogo size="sm" linkTo="/" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-7">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="w-full max-w-xl">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
            <Card className="relative overflow-hidden p-8 bg-background border border-border/60 shadow-premium rounded-2xl">
              <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: "var(--gradient-purple)" }} />
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Lista de Espera</h1>
                <p className="text-muted-foreground text-sm">Aplica ahora para ser parte de la plataforma líder en subastas de vehículos usados</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {tenants.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Empresa *</label>
                    <select value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} disabled={loading}
                      className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40">
                      <option value="">Selecciona tu empresa</option>
                      {tenants.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tipo de cuenta *</label>
                  <Select value={formData.role} onValueChange={v => handleChange("role", v)}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Selecciona tu rol" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dealer">Dealer (compra y vende)</SelectItem>
                      <SelectItem value="perito">Perito (inspecciones)</SelectItem>
                      <SelectItem value="recomprador">Recomprador (solo compra)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Empresa / Concesionario *
                    </label>
                    <select 
                      value={formData.companyId} 
                      onChange={(e) => handleChange("companyId", e.target.value)} 
                      disabled={loading}
                      className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40">
                      <option value="">Selecciona tu empresa</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">NIT</label>
                    <Input type="text" placeholder="900.123.456-7" value={formData.nit} onChange={(e) => handleChange("nit", e.target.value)} className={inputClass} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nombre de contacto *</label>
                    <Input type="text" placeholder="Carlos Mendoza" value={formData.contacto} onChange={(e) => handleChange("contacto", e.target.value)} className={inputClass} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Correo electrónico *</label>
                    <Input type="email" placeholder="carlos@automax.co" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={inputClass} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Teléfono *</label>
                    <Input type="tel" placeholder="+57 300 123 4567" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} className={inputClass} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ciudad *</label>
                    <select value={formData.ciudad} onChange={(e) => handleChange("ciudad", e.target.value)} disabled={loading}
                      className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40">
                      <option value="">Selecciona una ciudad</option>
                      <option value="Bogotá">Bogotá</option>
                      <option value="Medellín">Medellín</option>
                      <option value="Cali">Cali</option>
                      <option value="Barranquilla">Barranquilla</option>
                      <option value="Cartagena">Cartagena</option>
                      <option value="Bucaramanga">Bucaramanga</option>
                    </select>
                  </div>
                  {/* Sucursal - for ALL roles who are NOT independent */}
                  {formData.companyId && 
                   formData.companyId !== 'independiente' && 
                   formData.ciudad && (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        Sucursal *
                      </label>
                      <select 
                        value={formData.branchId} 
                        onChange={(e) => handleChange("branchId", e.target.value)} 
                        disabled={loading || loadingBranches || branches.length === 0}
                        className="h-11 w-full rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40">
                        <option value="">
                          {loadingBranches ? 'Cargando sucursales...' : branches.length > 0 ? 'Selecciona una sucursal' : 'No tengo sucursal'}
                        </option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name} - {b.address}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Address - show ONLY for independent users (ALL roles) */}
                  {formData.companyId === 'independiente' && (
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">
                        Dirección *
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Carrera 15 #123-45" 
                        value={formData.address} 
                        onChange={(e) => handleChange("address", e.target.value)} 
                        className={inputClass} 
                        disabled={loading} 
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contraseña *</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)} className={`${inputClass} pr-12`} disabled={loading} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Repetir contraseña *</label>
                    <div className="relative">
                      <Input type={showPassword2 ? "text" : "password"} placeholder="Repite tu contraseña" value={formData.password2}
                        onChange={(e) => handleChange("password2", e.target.value)} className={`${inputClass} pr-12`} disabled={loading} />
                      <button type="button" onClick={() => setShowPassword2((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-md p-1">
                        {showPassword2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 pt-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={formData.acepta} onChange={(e) => handleChange("acepta", e.target.checked)} disabled={loading} className="mt-1 h-4 w-4 rounded border-border" />
                  <span>Acepto los <Link to="/terminos-y-condiciones" target="_blank" className="text-violet-600 font-semibold hover:underline underline-offset-2">términos y condiciones</Link> y la <Link to="/politica-de-privacidad" target="_blank" className="text-violet-600 font-semibold hover:underline underline-offset-2">política de privacidad</Link> de Mubis™</span>
                </label>

                <Button type="submit" disabled={loading || !formData.acepta}
                  className="w-full h-11 font-semibold rounded-xl shadow-sm bg-violet-600 text-white hover:bg-violet-700 transition active:translate-y-[1px]">
                  {loading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Enviando solicitud...</>) : "Enviar solicitud"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">¿Ya tienes cuenta?{" "}
                  <Link to="/login" className="font-semibold text-foreground hover:underline underline-offset-4">Inicia sesión</Link>
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>

      <footer className="bg-footer text-footer-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-secondary" /><span>info@mubis.com</span>
        </div>
      </footer>
    </div>
  );
}
