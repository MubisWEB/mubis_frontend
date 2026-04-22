import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { superadminApi } from '@/api/services';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const EXPECTED_COLUMNS = ['Rol', 'Nombre', 'Email', 'Telefono', 'Ciudad', 'Empresa', 'Sucursal', 'NIT (opc)', 'Direccion (opc)'];
const ROLE_EXAMPLES = ['dealer', 'perito', 'recomprador', 'admin_general', 'admin_sucursal'];

export default function AdminCargaMasiva() {
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const isAdminGeneral = user?.role === 'admin_general';
  const backTo = isAdminGeneral ? '/AdminGeneralDashboard' : '/AdminDashboard';
  const availableRoles = isAdminGeneral ? ['admin_sucursal'] : ROLE_EXAMPLES;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const lowerName = selected.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
      toast.error('Solo se aceptan archivos Excel (.xlsx, .xls) o CSV');
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
        toast.error('No se pudo crear ningun usuario');
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

  const handleDownloadTemplate = () => {
    const rows = [
      EXPECTED_COLUMNS.map(col => col.replace(' (opc)', '')).join(','),
      ...(isAdminGeneral
        ? [
            `admin_sucursal,Admin Sucursal,admin.sucursal@mubis.co,3001234571,${user?.ciudad || 'Bogota'},${user?.company || 'Autoniza'},Sucursal existente,,`,
          ]
        : [
            'dealer,Juan Dealer,juan.dealer@mubis.co,3001234567,Bogota,Autoniza,Autoniza 170,900123456-1,Carrera 1 # 2-3',
            'perito,Ana Perito,ana.perito@mubis.co,3001234568,Bogota,Autoniza,Autoniza 170,,',
            'recomprador,Carlos Recomprador,carlos.recomprador@mubis.co,3001234569,Bogota,Autoniza,,,',
            'admin_general,Gerente General,gerente@mubis.co,3001234570,Bogota,Autoniza,,,',
            'admin_sucursal,Admin Sucursal,admin.sucursal@mubis.co,3001234571,Bogota,Autoniza,Autoniza 170,,',
          ]),
    ];
    const blob = new Blob([`\ufeff${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-carga-masiva-mubis.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-muted pb-28">
      <Header title="Carga Masiva" subtitle="Registrar usuarios por Excel" backTo={backTo} />

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        <Card className="p-4 border border-border shadow-sm">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            Instrucciones
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isAdminGeneral
              ? 'Sube un archivo Excel (.xlsx, .xls) o CSV para registrar admins de sucursal de tu concesionario.'
              : 'Sube un archivo Excel (.xlsx, .xls) o CSV con los datos de los usuarios a registrar.'}
            {' '}Cada usuario recibira un correo para establecer su contrasena.
          </p>
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm" className="mb-3 rounded-full gap-2">
            <Download className="w-4 h-4" />
            Descargar plantilla
          </Button>
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
            Los roles validos son: {availableRoles.map((role, index) => (
              <React.Fragment key={role}>
                <strong>{role}</strong>{index < availableRoles.length - 1 ? ', ' : '.'}
              </React.Fragment>
            ))}
            {' '}{isAdminGeneral
              ? 'Solo puedes cargar admins de sucursal de tu concesionario.'
              : 'Admin general no lleva sucursal; admin sucursal si requiere una sucursal existente.'}
            Los usuarios se crean como verificados automaticamente.
          </p>
        </Card>

        <Card className="border border-border shadow-sm overflow-hidden">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
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
                <p className="text-xs text-muted-foreground mt-1">Maximo 10MB · Formato .xlsx, .xls o .csv</p>
              </div>
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0 rounded-full flex-shrink-0">
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
