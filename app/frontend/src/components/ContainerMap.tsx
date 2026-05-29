import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Container, RouteStop } from '../types';
import { statusColor } from './StatusPill';

const LYON: [number, number] = [45.764, 4.8357];

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Force le recalcul de la taille de la carte (conteneur dimensionné après le montage). */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const timers = [100, 400, 1000].map((d) => setTimeout(fix, d));
    window.addEventListener('resize', fix);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', fix);
    };
  }, [map]);
  return null;
}

interface Props {
  containers: Container[];
  routeStops?: RouteStop[];
  onMapClick?: (lat: number, lng: number) => void;
}

export default function ContainerMap({ containers, routeStops, onMapClick }: Props) {
  const polyline: [number, number][] =
    routeStops?.slice().sort((a, b) => a.order - b.order).map((s) => [s.lat, s.lng]) ?? [];

  return (
    <MapContainer center={LYON} zoom={13} scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapResizer />
      {onMapClick && <ClickHandler onClick={onMapClick} />}

      {containers.map((c) => {
        const color = statusColor(c.status);
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={6 + Math.round(c.currentFillLevel / 25)}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: color, fillOpacity: 0.85 }}
          >
            <Popup>
              <div className="font-sans text-sm">
                <div className="font-semibold">{c.code}</div>
                <div className="text-gray-500">{c.address}</div>
                <div className="mt-1">
                  Remplissage : <b>{c.currentFillLevel}%</b>
                </div>
                <div style={{ color }}>● {c.status}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {polyline.length > 1 && (
        <Polyline positions={polyline} pathOptions={{ color: '#0f6b41', weight: 4, opacity: 0.85 }} />
      )}
    </MapContainer>
  );
}
