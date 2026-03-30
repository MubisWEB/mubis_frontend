import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { superadminApi } from '@/api/services';
import { toast } from 'sonner';

const EXPECTED_COLUMNS = ['Rol', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Empresa', 'Sucursal (opc)', 'NIT (opc)', 'Dirección (opc)'];

export default function AdminCargaMasiva() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
      toast.error('Solo se aceptan archivos Excel (.xlsx)');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede superar 10MB');
      return;
    }

    setFile(selected);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const data = await superadminApi.bulkUpload(file);
      setResult(data);
      if (data.created > 0 && (!data.errors || data.errors.length === 0)) {
        toast.success(`${data.created} usuarios creados exitosamente`);
      } else if (data.created > 0) {
        toast.warning(`${data.created} creados, ${data.errors.length} errores`);
      } else {
        toast.error('No se pudo crear ningún usuario');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Carga Masiva" subtitle="Registrar usuarios por Excel" backTo="/AdminDashboard" />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        {/* Instructions */}
        <Card className="p-4 border border-border shadow-sm">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            Instrucciones
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Sube un archivo Excel (.xlsx) con los datos de los usuarios a registrar.
            Cada usuario recibirá un correo para establecer su contraseña.
          </p>
          <div className="bg-muted rounded-xl p-3">
            <p className="text-xs font-medium text-foreground mb-2">Columnas requeridas:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXPECTED_COLUMNS.map(col => (
                <Badge key={col} variant="outline" className="text-xs rounded-full">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Los roles válidos son: <strong>dealer</strong>, <strong>perito</strong>, <strong>recomprador</strong>.
            Los usuarios se crean como verificados automáticamente.
          </p>
        </Card>

        {/* Upload area */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 flex flex-col items-center gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">Seleccionar archivo Excel</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo 10MB · Formato .xlsx</p>
              </div>
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!result && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full h-11 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Subir y procesar
                    </span>
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-4 border border-border shadow-sm space-y-3">
            <h3 className="font-bold text-foreground">Resultado de la carga</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <CheckCircle className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{result.created}</p>
                <p className="text-xs text-muted-foreground">Usuarios creados</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10 text-center">
                <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-1" />
                <p className="text-2xl font-bold text-destructive">{result.errors?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Detalle de errores:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-lg text-xs">
                      <Badge variant="outline" className="text-destructive border-destructive/20 rounded-full flex-shrink-0">
                        Fila {err.row}
                      </Badge>
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{err.field}:</strong> {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full rounded-full">
              Cargar otro archivo
            </Button>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
