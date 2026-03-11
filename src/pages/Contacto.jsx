import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import SponsorBanner from "@/components/SponsorBanner";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  { icon: Mail, label: "Email", value: "info@mubis.com", href: "mailto:info@mubis.com" },
  { icon: Phone, label: "Teléfono", value: "+57 601 234 5678", href: "tel:+576012345678" },
  { icon: MapPin, label: "Ubicación", value: "Bogotá, Colombia", href: null },
  { icon: Clock, label: "Horario", value: "Lun - Vie: 8am - 6pm", href: null },
];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.mensaje) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    toast.success('Mensaje enviado. Te contactaremos pronto.');
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-background py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              <span className="text-secondary">Contáctanos</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes preguntas? Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible.
            </p>
          </div>
        </section>

        <section className="bg-muted py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Contact form */}
              <Card className="p-6 sm:p-8 border border-border rounded-2xl bg-card">
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-5 h-5 text-secondary" />
                  <h2 className="text-xl font-bold text-foreground">Envíanos un mensaje</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input id="nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <textarea
                      id="mensaje"
                      value={form.mensaje}
                      onChange={e => setForm({ ...form, mensaje: e.target.value })}
                      placeholder="¿En qué podemos ayudarte?"
                      rows={5}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full gap-2">
                    <Send className="w-4 h-4" /> Enviar mensaje
                  </Button>
                </form>
              </Card>

              {/* Contact info */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-foreground">Información de contacto</h2>
                <div className="space-y-4">
                  {contactInfo.map((item, i) => {
                    const Icon = item.icon;
                    const Content = (
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                          <p className="font-semibold text-foreground text-sm">{item.value}</p>
                        </div>
                      </div>
                    );
                    return item.href ? <a key={i} href={item.href}>{Content}</a> : <div key={i}>{Content}</div>;
                  })}
                </div>

                <Card className="p-6 border border-border rounded-2xl bg-secondary/5">
                  <h3 className="font-bold text-foreground mb-2">¿Eres concesionario?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Si quieres unirte a nuestra red de dealers verificados, aplica directamente.</p>
                  <a href="/registro" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
                    Aplicar como Dealer →
                  </a>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
