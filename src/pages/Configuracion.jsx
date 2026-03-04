import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageCircle, Smartphone, Gavel, Trophy, ClipboardCheck, Users, Moon, Globe } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getCurrentUser, getUserRole } from '@/lib/mockStore';
import { toast } from 'sonner';

const SETTINGS_KEY = (userId) => `mubis_user_settings_${userId}`;

const DEFAULT_SETTINGS = {
  notif_email: true,
  notif_telegram: false,
  notif_inapp: true,
  auction_ending: true,
  bid_surpassed: true,
  auction_won: true,
  new_inspection: true,
  new_pending_user: true,
  dark_mode: false,
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
  const user = getCurrentUser();
  const role = getUserRole();
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
    <div className="min-h-screen bg-background pb-24">
      <Header title="Configuración" subtitle="Personaliza tu experiencia" backTo="/Cuenta" />

      <div className="px-4 py-4 space-y-4">
        {/* Notification preferences */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Canales de notificación</p>
          <Card className="border border-border shadow-sm rounded-xl px-4 divide-y divide-border">
            <SwitchRow icon={Mail} label="Email" settingKey="notif_email" />
            <SwitchRow icon={MessageCircle} label="Telegram" settingKey="notif_telegram" />
            <SwitchRow icon={Smartphone} label="In-app" settingKey="notif_inapp" />
          </Card>
        </motion.div>

        {/* Auction preferences */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Preferencias de subastas</p>
          <Card className="border border-border shadow-sm rounded-xl px-4 divide-y divide-border">
            <SwitchRow icon={Bell} label="Subasta por terminar" settingKey="auction_ending" />
            {(role === 'dealer' || role === 'recomprador') && (
              <>
                <SwitchRow icon={Gavel} label="Me superaron la puja" settingKey="bid_surpassed" />
                <SwitchRow icon={Trophy} label="Gané una subasta" settingKey="auction_won" />
              </>
            )}
            {role === 'perito' && (
              <SwitchRow icon={ClipboardCheck} label="Nuevo peritaje disponible" settingKey="new_inspection" />
            )}
            {role === 'admin' && (
              <SwitchRow icon={Users} label="Nuevo usuario pendiente" settingKey="new_pending_user" />
            )}
          </Card>
        </motion.div>

        {/* UI */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Interfaz</p>
          <Card className="border border-border shadow-sm rounded-xl px-4 divide-y divide-border">
            <SwitchRow icon={Moon} label="Modo oscuro" settingKey="dark_mode" />
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
