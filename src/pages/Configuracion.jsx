import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageCircle, Gavel, Trophy, ClipboardCheck, Users, Globe, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const SETTINGS_KEY = (userId) => `mubis_user_settings_${userId}`;

const DEFAULT_SETTINGS = {
  notif_email: true,
  notif_whatsapp: false,
  auction_ending: true,
  auction_finished: true,
  new_activity: true,
  new_verification_request: true,
  new_inspection_available: true,
};

function loadSettings(userId) {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY(userId));
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(userId, settings) {
  localStorage.setItem(SETTINGS_KEY(userId), JSON.stringify(settings));
}

export default function Configuracion() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [settings, setSettings] = useState(() => loadSettings(user?.id));

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveSettings(user?.id, settings);
    toast.success('Configuración guardada');
  };

  const SwitchRow = ({ icon: Icon, label, settingKey }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <Label className="text-sm font-medium text-foreground cursor-pointer">{label}</Label>
      </div>
      <Switch checked={settings[settingKey]} onCheckedChange={() => toggle(settingKey)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/Cuenta')} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">Configuración</h1>
            <p className="text-xs text-muted-foreground">Personaliza tu experiencia</p>
          </div>
        </div>
        {/* Channels */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Canales de notificación</p>
          <Card className="border border-border shadow-sm rounded-xl px-4 divide-y divide-border">
            <SwitchRow icon={Mail} label="Email" settingKey="notif_email" />
            <SwitchRow icon={MessageCircle} label="Whatsapp" settingKey="notif_whatsapp" />
          </Card>
        </motion.div>

        {/* Role-specific preferences */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Preferencias de subastas</p>
          <Card className="border border-border shadow-sm rounded-xl px-4 divide-y divide-border">
            {(role === 'dealer' || role === 'recomprador') && (
              <>
                <SwitchRow icon={Bell} label="Subasta por terminar" settingKey="auction_ending" />
                <SwitchRow icon={Gavel} label="Subasta finalizada" settingKey="auction_finished" />
                <SwitchRow icon={Trophy} label="Nueva actividad relevante" settingKey="new_activity" />
              </>
            )}
            {role === 'superadmin' && (
              <SwitchRow icon={Users} label="Nuevas solicitudes de verificación" settingKey="new_verification_request" />
            )}
            {role === 'perito' && (
              <SwitchRow icon={ClipboardCheck} label="Nuevo peritaje disponible" settingKey="new_inspection_available" />
            )}
          </Card>
        </motion.div>

        {/* UI */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Interfaz</p>
          <Card className="border border-border shadow-sm rounded-xl px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium text-foreground">Idioma</Label>
              </div>
              <span className="text-sm text-muted-foreground">Español</span>
            </div>
          </Card>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
          <Button className="w-full h-11 rounded-full font-medium" onClick={handleSave}>
            Guardar cambios
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
