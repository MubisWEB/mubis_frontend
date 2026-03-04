import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Clock, HelpCircle, Send } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { getCurrentUser, getUserRole, addSupportTicket } from '@/lib/mockStore';
import { toast } from 'sonner';

const FAQ_SECTIONS = [
  {
    title: 'Subastas',
    items: [
      {
        q: '¿Cómo funciona una subasta en Mubis?',
        a: 'Cuando un vehículo pasa el peritaje, se publica automáticamente en subasta por 1 hora. Los recompradores y dealers pueden pujar durante ese tiempo. Al finalizar, el postor con la puja más alta gana la subasta.',
      },
      {
        q: '¿Cuál es el incremento mínimo de puja?',
        a: 'El incremento mínimo es de $100.000 COP sobre la puja actual. No se permiten pujas menores a ese incremento.',
      },
      {
        q: '¿Qué información veo antes de pujar?',
        a: 'Antes de pujar puedes ver las fotos del vehículo, marca, modelo, año, kilometraje, documentación (SOAT, Tecnomecánica, Multas), el score del peritaje con detalle por categoría, y el historial de pujas en tiempo real.',
      },
    ],
  },
  {
    title: 'Venta (Dealer)',
    items: [
      {
        q: '¿Cuándo se publica mi vehículo?',
        a: 'Tu vehículo se publica en subasta automáticamente cuando un perito de tu misma sucursal completa el peritaje y lo aprueba con score satisfactorio.',
      },
      {
        q: '¿Por qué requiere peritaje?',
        a: 'El peritaje garantiza transparencia para los compradores. Evalúa motor, transmisión, suspensión, frenos, carrocería, interior, sistema eléctrico y llantas, generando un score confiable de 0 a 100.',
      },
    ],
  },
  {
    title: 'Peritajes',
    items: [
      {
        q: '¿Cómo se asigna un peritaje por sucursal?',
        a: 'Los peritos solo ven vehículos pendientes de la misma sucursal donde están registrados. Pueden tomar un peritaje disponible y completar la evaluación en las 8 categorías establecidas.',
      },
    ],
  },
  {
    title: 'Documentación',
    items: [
      {
        q: '¿Por qué se piden SOAT, Tecnomecánica y Multas?',
        a: 'Son documentos legales obligatorios en Colombia para la compraventa de vehículos. Mubis los muestra para que el comprador conozca el estado legal completo del vehículo antes de pujar.',
      },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      {
        q: '¿Cómo actualizo mi nombre o teléfono?',
        a: 'Ve a Cuenta > Mi perfil. Allí puedes editar tu nombre y número de teléfono. Los cambios se guardan inmediatamente. La empresa y sucursal no son editables desde la app.',
      },
    ],
  },
];

const CASE_TYPES = [
  { value: 'subasta', label: 'Subasta' },
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'documentacion', label: 'Documentación' },
  { value: 'cuenta', label: 'Cuenta' },
  { value: 'otro', label: 'Otro' },
];

export default function AyudaSoporte() {
  const user = getCurrentUser();
  const role = getUserRole();
  const [caseType, setCaseType] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    if (!caseType) { toast.error('Selecciona un tipo de caso'); return; }
    if (!description.trim()) { toast.error('Describe tu solicitud'); return; }

    addSupportTicket({
      userId: user?.id,
      role: role,
      type: caseType,
      message: description.trim(),
    });

    toast.success('Solicitud enviada');
    setCaseType('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Ayuda y soporte" subtitle="Preguntas frecuentes y contacto" backTo="/Cuenta" />

      <div className="px-4 py-4 space-y-4">
        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Preguntas frecuentes</p>
          <Card className="border border-border shadow-sm rounded-xl px-4">
            {FAQ_SECTIONS.map((section, si) => (
              <div key={si}>
                {si > 0 && <div className="border-t border-border" />}
                <p className="text-xs font-semibold text-secondary pt-3 pb-1">{section.title}</p>
                <Accordion type="single" collapsible>
                  {section.items.map((item, ii) => (
                    <AccordionItem key={ii} value={`${si}-${ii}`} className="border-b-0">
                      <AccordionTrigger className="text-sm text-foreground py-3 hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-3">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </Card>
        </motion.div>

        {/* Contact form */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Contactar soporte</p>
          <Card className="border border-border shadow-sm rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input value={user?.nombre || ''} disabled className="text-sm opacity-70" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ''} disabled className="text-sm opacity-70" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de caso</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Descripción</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe tu problema o consulta..."
                rows={4}
                className="text-sm"
              />
            </div>
            <Button className="w-full h-10 rounded-full font-medium" onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-2" />Enviar solicitud
            </Button>
          </Card>
        </motion.div>

        {/* Support info */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border border-border shadow-sm rounded-xl p-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">soporte@mubis.co</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Lunes a Viernes, 8:00 am – 6:00 pm</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Mubis v1.0.0</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
