import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, FileCheck, AlertCircle, Mail, Phone, MapPin, Building } from 'lucide-react';
import MubisLogo from '@/components/MubisLogo';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import TopBar from "@/components/TopBar";

const initialRequests = [
  { id: '1', name: 'AutoMundo', email: 'contacto@automundo.com', phone: '3001234567', city: 'Bogotá', nit: '900111222-3', requested_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), documents: { nit_uploaded: true, rut_uploaded: true, chamber_commerce: true } },
  { id: '2', name: 'Carros Premium', email: 'info@carrospremium.com', phone: '3159876543', city: 'Medellín', nit: '900222333-4', requested_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), documents: { nit_uploaded: true, rut_uploaded: true, chamber_commerce: true } },
  { id: '3', name: 'Motor Sales', email: 'ventas@motorsales.com', phone: '3204567890', city: 'Cali', nit: '900333444-5', requested_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), documents: { nit_uploaded: true, rut_uploaded: false, chamber_commerce: true } }
];

export default function AdminSolicitudes() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('mubis_user_email') || '';
  const isTestUser = userEmail === 'admin@mubis.com';
  const [requests, setRequests] = useState(isTestUser ? initialRequests : []);
  const formatDate = (date) => { const diff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)); if (diff === 0) return 'Hoy'; if (diff === 1) return 'Ayer'; return `Hace ${diff} días`; };
  const allDocsUploaded = (docs) => docs.nit_uploaded && docs.rut_uploaded && docs.chamber_commerce;
  const handleApprove = (request) => { setRequests(prev => prev.filter(r => r.id !== request.id)); toast.success('Dealer aprobado', { description: `${request.name} ha sido aprobado y puede empezar a pujar` }); };
  const handleReject = (request) => { setRequests(prev => prev.filter(r => r.id !== request.id)); toast.error('Solicitud rechazada', { description: `Se ha rechazado la solicitud de ${request.name}` }); };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <TopBar />
      <div className="bg-gradient-brand px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('AdminDashboard'))} className="text-white hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></Button>
          <MubisLogo size="md" variant="light" />
          <div className="w-10"></div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2 font-sans">Solicitudes Pendientes</h1>
        <p className="text-white/60 text-center text-sm">{requests.length} solicitudes por revisar</p>
      </div>

      <div className="px-4 -mt-4">
        {requests.length === 0 ? (
          <Card className="p-8 text-center border border-border shadow-sm"><CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" /><h3 className="font-bold text-foreground mb-2 font-sans">Todo al día</h3><p className="text-sm text-muted-foreground">No hay solicitudes pendientes por revisar</p></Card>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <Card key={request.id} className="p-4 border border-border shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{request.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" />{request.city}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Building className="w-3 h-3" />NIT: {request.nit}</div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">{formatDate(request.requested_date)}</Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{request.email}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{request.phone}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2"><FileCheck className="w-4 h-4 text-foreground" /><span className="text-sm font-semibold text-foreground">Documentos</span></div>
                  <div className="space-y-1">
                    {[['NIT / Cédula', request.documents.nit_uploaded], ['RUT', request.documents.rut_uploaded], ['Cámara de Comercio', request.documents.chamber_commerce]].map(([name, uploaded]) => (
                      <div key={name} className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{name}</span>{uploaded ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}</div>
                    ))}
                  </div>
                </div>
                {!allDocsUploaded(request.documents) && (
                  <div className="bg-accent border border-accent rounded-lg p-2 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0" /><span className="text-xs text-accent-foreground">Documentos incompletos</span></div>
                )}
                <div className="flex gap-2">
                  <Button onClick={() => handleReject(request)} variant="outline" className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full"><XCircle className="w-4 h-4 mr-1" />Rechazar</Button>
                  <Button onClick={() => handleApprove(request)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full" disabled={!allDocsUploaded(request.documents)}><CheckCircle className="w-4 h-4 mr-1" />Aprobar</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
