import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons under Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

function ClickHandler({
  onChange,
  readOnly,
}: {
  onChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!readOnly) onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const GB_CENTER: [number, number] = [-40.85, 172.8];

export function MapPicker({ latitude, longitude, onChange, readOnly }: MapPickerProps) {
  const [pos, setPos] = useState<[number, number]>([
    latitude ?? GB_CENTER[0],
    longitude ?? GB_CENTER[1],
  ]);

  useEffect(() => {
    if (latitude != null && longitude != null) setPos([latitude, longitude]);
  }, [latitude, longitude]);

  return (
    <MapContainer center={pos} zoom={11} className="leaflet-container w-100" scrollWheelZoom={!readOnly}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={pos}
        draggable={!readOnly}
        eventHandlers={{
          dragend: (e) => {
            const m = e.target as L.Marker;
            const { lat, lng } = m.getLatLng();
            setPos([lat, lng]);
            onChange(lat, lng);
          },
        }}
      />
      <ClickHandler
        readOnly={readOnly}
        onChange={(lat, lng) => {
          setPos([lat, lng]);
          onChange(lat, lng);
        }}
      />
    </MapContainer>
  );
}
