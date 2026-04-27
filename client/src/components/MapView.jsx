import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Markers
const createPulseIcon = (color) => {
  return L.divIcon({
    className: 'custom-pulse-icon',
    html: `
      <div class="relative">
        <div class="absolute inset-0 w-8 h-8 -left-4 -top-4 bg-${color} rounded-full animate-ping opacity-20"></div>
        <div class="w-4 h-4 -left-2 -top-2 bg-${color} rounded-full border-2 border-white shadow-lg"></div>
      </div>
    `,
    iconSize: [20, 20],
  });
};

const MapView = ({ needs, volunteers }) => {
  const center = [28.6139, 77.2090];

  return (
    <MapContainer center={center} zoom={12} className="z-0 bg-[#020617]" zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {needs.map(need => (
        <React.Fragment key={need.id}>
          <Marker 
            position={[need.location.lat, need.location.lng]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="relative group">
                  <div class="absolute inset-0 w-12 h-12 -left-6 -top-6 bg-${need.urgencyScore > 80 ? 'rose' : (need.urgencyScore > 50 ? 'amber' : 'emerald')}-500 blur-xl opacity-40 group-hover:opacity-80 transition-opacity"></div>
                  <div class="w-4 h-4 -left-2 -top-2 bg-${need.urgencyScore > 80 ? 'rose' : (need.urgencyScore > 50 ? 'amber' : 'emerald')}-500 rounded-full border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
                </div>
              `
            })}
          >
            <Popup className="premium-popup">
              <div className="text-slate-200 font-sans p-2 bg-[#020617] rounded-lg">
                <p className="font-black text-[10px] tracking-widest text-primary-500 uppercase mb-1">{need.type}</p>
                <p className="font-bold text-sm mb-1">{need.location.name}</p>
                <p className="text-xs text-slate-400 mb-3">{need.summary}</p>
                <div className="flex justify-between items-center border-t border-white/10 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Urgency Score</span>
                  <span className={`text-xs font-black ${need.urgencyScore > 80 ? 'text-rose-500' : 'text-amber-500'}`}>{need.urgencyScore}%</span>
                </div>
              </div>
            </Popup>
          </Marker>
          <Circle 
            center={[need.location.lat, need.location.lng]} 
            radius={800} 
            pathOptions={{ 
              color: need.urgencyScore > 80 ? '#f43f5e' : (need.urgencyScore > 50 ? '#f59e0b' : '#10b981'),
              fillColor: need.urgencyScore > 80 ? '#f43f5e' : (need.urgencyScore > 50 ? '#f59e0b' : '#10b981'),
              fillOpacity: 0.1,
              weight: 1
            }} 
          />
        </React.Fragment>
      ))}

      {volunteers.map(vol => (
        <Marker 
          key={vol.id} 
          position={[vol.location.lat, vol.location.lng]}
          icon={L.divIcon({
            className: 'volunteer-marker',
            html: `
              <div class="relative">
                <div class="absolute inset-0 w-8 h-8 -left-4 -top-4 bg-primary-500 blur-lg opacity-30"></div>
                <div class="w-3 h-3 -left-1.5 -top-1.5 bg-primary-400 rounded-full border border-white shadow-lg shadow-primary-500/50"></div>
              </div>
            `
          })}
        >
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <p className="font-bold">{vol.name}</p>
              <p className="text-xs text-slate-500">Active Responder • {vol.skills[0]}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
