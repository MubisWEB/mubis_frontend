import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Clock, Route, ExternalLink, Car } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Bogotá neighborhoods with realistic coords
const BOGOTA_LOCATIONS = [
  { lat: 4.6697, lng: -74.0530, address: 'Cra 7 #72-41, Chapinero' },
  { lat: 4.7110, lng: -74.0721, address: 'Av Cll 127 #20-78, Usaquén' },
  { lat: 4.6950, lng: -74.0322, address: 'Cll 85 #15-30, Zona Rosa' },
  { lat: 4.6260, lng: -74.0660, address: 'Av Cll 26 #59-51, CAN' },
  { lat: 4.6480, lng: -74.1080, address: 'Cra 68D #37-51, Kennedy' },
  { lat: 4.7350, lng: -74.0390, address: 'Autopista Norte #183-40, Toberín' },
  { lat: 4.6100, lng: -74.0820, address: 'Av 1ro de Mayo #30-20, Restrepo' },
  { lat: 4.6780, lng: -74.0480, address: 'Cll 53 #13-40, Chapinero Central' },
  { lat: 4.7560, lng: -74.0450, address: 'Cll 200 #18-30, Lijacá' },
  { lat: 4.6380, lng: -74.1350, address: 'Av Ciudad de Cali #42-50, Fontibón' },
];

function numberIcon(number) {
  return L.divIcon({
    className: 'custom-route-marker',
    html: `<div style="
      background: hsl(142, 76%, 36%);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function startIcon() {
  return L.divIcon({
    className: 'custom-route-marker',
    html: `<div style="
      background: hsl(221, 83%, 53%);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">🏠</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function haversine(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Nearest-neighbor TSP approximation
function optimizeRoute(start, stops) {
  if (stops.length === 0) return { order: [], totalKm: 0 };
  const remaining = stops.map((s, i) => ({ ...s, idx: i }));
  const order = [];
  let current = start;
  let totalKm = 0;

  while (remaining.length > 0) {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(current, remaining[i].coords);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    totalKm += minDist;
    current = remaining[nearest].coords;
    order.push(remaining[nearest]);
    remaining.splice(nearest, 1);
  }

  return { order, totalKm };
}

function formatCOP(val) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
}

export default function RouteAssistant({ open, onOpenChange, inProcessAuctions = [] }) {
  const userOrigin = { lat: 4.6690, lng: -74.0625, label: 'Tu oficina (Bogotá)' };

  const stops = useMemo(() => {
    // Only Bogotá vehicles for this mockup
    const bogotaAuctions = inProcessAuctions.filter(a => !a.city || a.city === 'Bogotá');
    return bogotaAuctions.map((a, i) => {
      const loc = BOGOTA_LOCATIONS[i % BOGOTA_LOCATIONS.length];
      return {
        id: a.id,
        brand: a.brand,
        model: a.model,
        year: a.year,
        city: 'Bogotá',
        address: loc.address,
        coords: { lat: loc.lat, lng: loc.lng },
        price: a.current_bid,
      };
    });
  }, [inProcessAuctions]);

  const { order, totalKm } = useMemo(() => optimizeRoute(userOrigin, stops), [stops]);
  const estimatedMinutes = Math.round(totalKm * 1.4); // ~1.4 min/km avg in Colombian cities
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const estimatedMins = estimatedMinutes % 60;

  const routeCoords = [
    [userOrigin.lat, userOrigin.lng],
    ...order.map(s => [s.coords.lat, s.coords.lng]),
  ];

  const center = order.length > 0
    ? [(userOrigin.lat + order.reduce((s, o) => s + o.coords.lat, 0) / order.length) / 2 + userOrigin.lat / 2,
       (userOrigin.lng + order.reduce((s, o) => s + o.coords.lng, 0) / order.length) / 2 + userOrigin.lng / 2]
    : [userOrigin.lat, userOrigin.lng];

  const bounds = routeCoords.length > 1
    ? L.latLngBounds(routeCoords.map(c => L.latLng(c[0], c[1])))
    : null;

  const googleMapsUrl = useMemo(() => {
    if (order.length === 0) return '';
    const origin = `${userOrigin.lat},${userOrigin.lng}`;
    const destination = `${order[order.length - 1].coords.lat},${order[order.length - 1].coords.lng}`;
    const waypoints = order.slice(0, -1).map(s => `${s.coords.lat},${s.coords.lng}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
  }, [order]);

  const wazeUrl = useMemo(() => {
    if (order.length === 0) return '';
    const first = order[0];
    return `https://waze.com/ul?ll=${first.coords.lat},${first.coords.lng}&navigate=yes`;
  }, [order]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Route className="w-5 h-5 text-secondary" />
            Asistente de ruta
          </DialogTitle>
        </DialogHeader>

        {order.length === 0 ? (
          <div className="text-center py-12 px-5">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">No hay vehículos en proceso</p>
            <p className="text-muted-foreground text-sm">Cuando tengas vehículos ganados en proceso, podrás planificar tu ruta optimizada aquí.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Map */}
            <div className="h-[280px] md:h-[340px] w-full">
              <MapContainer
                bounds={bounds}
                boundsOptions={{ padding: [40, 40] }}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
                style={{ borderRadius: 0 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[userOrigin.lat, userOrigin.lng]} icon={startIcon()}>
                  <Popup>{userOrigin.label}</Popup>
                </Marker>
                {order.map((stop, i) => (
                  <Marker key={stop.id} position={[stop.coords.lat, stop.coords.lng]} icon={numberIcon(i + 1)}>
                    <Popup>
                      <strong>{stop.brand} {stop.model} {stop.year}</strong><br />
                      {stop.address}, {stop.city}
                    </Popup>
                  </Marker>
                ))}
                <Polyline positions={routeCoords} pathOptions={{ color: 'hsl(142, 76%, 36%)', weight: 4, opacity: 0.8, dashArray: '8 6' }} />
              </MapContainer>
            </div>

            {/* Summary */}
            <div className="px-5 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center border-border">
                  <MapPin className="w-4 h-4 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{order.length}</p>
                  <p className="text-[10px] text-muted-foreground">Paradas</p>
                </Card>
                <Card className="p-3 text-center border-border">
                  <Navigation className="w-4 h-4 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{Math.round(totalKm)} km</p>
                  <p className="text-[10px] text-muted-foreground">Distancia total</p>
                </Card>
                <Card className="p-3 text-center border-border">
                  <Clock className="w-4 h-4 text-secondary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{estimatedHours > 0 ? `${estimatedHours}h ${estimatedMins}m` : `${estimatedMins}m`}</p>
                  <p className="text-[10px] text-muted-foreground">Tiempo est.</p>
                </Card>
              </div>

              {/* Ordered stops */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Orden de visitas recomendado</p>
                <div className="space-y-2">
                  {/* Origin */}
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">🏠</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">Punto de inicio</p>
                      <p className="text-xs text-muted-foreground truncate">{userOrigin.label}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary text-[10px]">Inicio</Badge>
                  </div>

                  {order.map((stop, i) => (
                    <div key={stop.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{stop.brand} {stop.model} {stop.year}</p>
                        <p className="text-xs text-muted-foreground truncate">{stop.address}, {stop.city}</p>
                      </div>
                      <p className="text-xs font-medium text-foreground whitespace-nowrap">{formatCOP(stop.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* External links */}
              <div className="grid grid-cols-2 gap-2 pt-2 pb-2">
                <Button asChild variant="outline" className="rounded-xl h-11 font-medium">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1.5" />Google Maps
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-xl h-11 font-medium">
                  <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1.5" />Waze
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
