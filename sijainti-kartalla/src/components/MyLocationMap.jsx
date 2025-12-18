import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Korjataan Leafletin oletusikonit
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 2. Apukomponentti kartan liikuttamiseen sijainnin mukaan
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

// 3. Pääkomponentti
export default function MyLocationMap() {
  const [position, setPosition] = useState([60.1695, 24.9354]); // aloitussijainti (Helsinki)
  const [path, setPath] = useState([]);
  const [tracking, setTracking] = useState(true);

  const watchId = useRef(null);

  useEffect(() => {
    if (!tracking) {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      return;
    }

    if ('geolocation' in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPos = [latitude, longitude];

          setPosition(newPos);
          setPath(prev => [...prev, newPos]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation ei ole tuettu tässä selaimessa.');
    }

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [tracking]);

  const toggleTracking = () => {
    if (tracking) {
      setTracking(false);
    } else {
      setPath([]); // aloitetaan uusi reitti
      setTracking(true);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Kartta ja reitti</h2>

      <div style={{ marginBottom: '10px' }}>
        Lat: {position[0].toFixed(5)}, Lon: {position[1].toFixed(5)}
      </div>

      <button
        onClick={toggleTracking}
        style={{
          padding: '10px',
          marginBottom: '10px',
          backgroundColor: tracking ? 'red' : 'green',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {tracking ? 'Pysäytä' : 'Jatka seurantaa'}
      </button>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tracking && <MapUpdater position={position} />}

        <Marker position={position}>
          <Popup>Olet tässä</Popup>
        </Marker>

        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
}
