import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Tactical Custom Marker
const createCustomIcon = (priority) => {
  const color = priority === 'Critical' ? '#ef4444' : '#3b82f6';
  const html = `
    <div style="position: relative; width: 32px; height: 32px;">
      <div style="position: absolute; inset: 0; background: ${color}; border-radius: 50%; opacity: 0.2; animation: pulse 2s infinite;"></div>
      <div style="position: absolute; inset: 6px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px ${color}80;"></div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `;
  return L.divIcon({
    html,
    className: 'custom-tactical-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Component to handle dynamic map centering/zooming
const MapRecenter = ({ tasks }) => {
  const map = useMap();
  useEffect(() => {
    if (tasks.length > 0) {
      const bounds = L.latLngBounds(tasks.map(t => [t.location.lat, t.location.lng]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
    }
  }, [tasks, map]);
  return null;
};

const MapView = ({ tasks = [], hideHeader = false }) => {
  // FILTER: Only show tasks that are NOT completed on the map
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  
  const defaultCenter = [28.6139, 77.2090]; // Delhi as fallback

  return (
    <div className="w-full h-full relative group">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />

        <MapRecenter tasks={activeTasks} />

        {activeTasks.map((task) => (
          <React.Fragment key={task.id}>
            <Marker 
              position={[task.location.lat, task.location.lng]} 
              icon={createCustomIcon(task.priority)}
            >
              <Popup>
                <div className="p-3 bg-[#020617] text-white rounded-xl min-w-[200px]">
                  <h4 className="font-black uppercase text-xs tracking-widest text-primary-400 mb-1">{task.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">{task.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-primary-500/20 text-primary-500'}`}>
                      {task.priority}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{task.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {task.priority === 'Critical' && (
              <Circle 
                center={[task.location.lat, task.location.lng]}
                radius={1200}
                pathOptions={{ 
                  color: '#ef4444', 
                  fillColor: '#ef4444', 
                  fillOpacity: 0.1, 
                  weight: 1,
                  dashArray: '5, 10'
                }}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>

      {/* TACTICAL OVERLAYS */}
      {!hideHeader && (
        <div className="absolute top-8 left-8 z-[500] pointer-events-none">
          <div className="bg-[#020617]/80 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl flex items-center gap-4 shadow-2xl shadow-black/50">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Signal Tracking</span>
          </div>
        </div>
      )}

      {/* CORNER DECORATION */}
      <div className="absolute bottom-8 left-8 z-[500] pointer-events-none hidden lg:block">
        <div className="bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-[8px] font-black uppercase text-slate-600 tracking-widest">
          Node: Rescue_Alpha_01 // Layer: Tactical_Visual
        </div>
      </div>
    </div>
  );
};

export default MapView;
