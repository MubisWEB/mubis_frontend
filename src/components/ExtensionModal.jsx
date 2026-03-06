import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarPlus, CheckCircle } from 'lucide-react';

const EXTENSION_OPTIONS = [
  { value: '4', label: '4 días más' },
  { value: '8', label: '8 días más' },
];

const REASONS = [
  { value: 'documentacion', label: 'Demora en documentación' },
  { value: 'peritaje', label: 'Problemas del Peritaje' },
  { value: 'vendedor', label: 'Cliente (Vendedor) demorado' },
  { value: 'otra', label: 'Otra' },
];

export default function ExtensionModal({ open, onOpenChange, onConfirm, vehicleName }) {
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [otherText, setOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = days && reason && (reason !== 'otra' || otherText.trim());

  const handleConfirm = () => {
    if (!canSubmit) return;
    const finalReason = reason === 'otra' ? otherText.trim() : REASONS.find(r => r.value === reason)?.label;
    onConfirm({ days: Number(days), reason: finalReason });
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setDays('');
      setReason('');
      setOtherText('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-2xl">
        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Extensión solicitada</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Se han agregado <strong>{days} días</strong> adicionales al cierre de <strong>{vehicleName}</strong>.
            </p>
            <Button onClick={handleClose} className="w-full rounded-xl mt-2">Entendido</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <CalendarPlus className="w-5 h-5 text-secondary" />
                <DialogTitle className="text-lg font-bold text-foreground">Extender plazo de cierre</DialogTitle>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Selecciona cuántos días adicionales necesitas y la razón de la extensión.
              </DialogDescription>
            </DialogHeader>

            {/* Days selection */}
            <div className="space-y-3 mt-2">
              <p className="text-sm font-semibold text-foreground">¿Cuántos días adicionales?</p>
              <div className="grid grid-cols-2 gap-3">
                {EXTENSION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className={`rounded-xl border-2 p-3 text-center text-sm font-semibold transition-colors ${
                      days === opt.value
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-border bg-card text-foreground hover:border-secondary/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason selection */}
            <div className="space-y-3 mt-4">
              <p className="text-sm font-semibold text-foreground">Razón de la extensión</p>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {REASONS.map(r => (
                  <div key={r.value} className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50" onClick={() => setReason(r.value)}>
                    <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                    <Label htmlFor={`reason-${r.value}`} className="text-sm text-foreground cursor-pointer flex-1">{r.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {reason === 'otra' && (
                <Textarea
                  placeholder="Escribe aquí la razón..."
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  className="rounded-xl text-sm"
                  rows={3}
                />
              )}
            </div>

            <Button onClick={handleConfirm} disabled={!canSubmit} className="w-full rounded-xl mt-4">
              Confirmar extensión
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
