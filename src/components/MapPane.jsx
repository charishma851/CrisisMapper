import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for urgency levels
const createIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: '<div style="' +
      'background-color: ' + color + ';' +
      'width: 24px;' +
      'height: 24px;' +
      'border-radius: 50%;' +
      'border: 3px solid white;' +
      'box-shadow: 0 0 10px ' + color + ';' +
      'animation: pulse 2s infinite;' +
    '"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  Critical: createIcon('var(--status-critical)'),
  Urgent: createIcon('var(--status-urgent)'),
  Stable: createIcon('var(--status-stable)'),
  Resolved: createIcon('var(--text-tertiary)'), // Grey icon for resolved
  Claimed: createIcon('#3b82f6') // Blue icon for claimed
};

// Distinct icon for the User/Volunteer location
const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #3b82f6; /* Blue */
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 15px #3b82f6;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Component to handle map center updates when new data comes in
const MapUpdater = ({ incidents }) => {
  const map = useMap();
  
  useEffect(() => {
    if (incidents.length > 0) {
      // Find bounds of all markers to fit them on screen
      const bounds = L.latLngBounds(incidents.map(inc => [inc.lat, inc.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.5 });
    }
  }, [incidents, map]);

  return null;
};

const MapPane = ({ incidents, userLocation }) => {
  // Center of India initially
  const defaultCenter = [20.5937, 78.9629];
  const defaultZoom = 5;
  
  // Restrict map panning to India and surrounding region
  const indiaBounds = L.latLngBounds(
    [5.0, 65.0],  // Southwest coordinates
    [38.0, 100.0] // Northeast coordinates
  );

  return (
    <div className="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        minZoom={5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme map tiles
        />
        
        {/* Render Volunteer / User Location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div style={{ padding: '4px', fontWeight: 'bold' }}>
                📍 You are here (Volunteer)
              </div>
            </Popup>
          </Marker>
        )}
        
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng]}
            icon={incident.resolved ? icons.Resolved : (incident.claimed ? icons.Claimed : (icons[incident.urgencyLabel] || icons.Stable))}
            opacity={incident.resolved ? 0.6 : 1}
          >
            <Popup className="custom-popup">
              <div style={{ padding: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className={"badge badge-" + incident.urgencyLabel.toLowerCase()}>
                    {incident.urgencyLabel}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {incident.needType}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', lineHeight: '1.4' }}>
                  {incident.text}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📍 {incident.location}</span>
                  <span style={{ color: incident.confidence >= 90 ? 'var(--status-stable)' : 'var(--status-urgent)' }}>
                    {incident.confidence}% Conf
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapUpdater incidents={incidents} />
      </MapContainer>
      
      {/* Map Overlay Stats */}
      <div className="map-overlay stats-panel glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Live Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Total Requests</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--status-critical)' }}>
          <span>Critical</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.filter(i => i.urgencyLabel === 'Critical' && !i.resolved).length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-urgent)', marginBottom: '0.25rem' }}>
          <span>Urgent</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.filter(i => i.urgencyLabel === 'Urgent' && !i.resolved).length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6', marginBottom: '0.25rem' }}>
          <span>Claimed</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.filter(i => i.claimed && !i.resolved).length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
          <span>Resolved</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.filter(i => i.resolved).length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.25rem', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
          <span>People Impacted</span>
          <span style={{ fontWeight: 'bold' }}>{incidents.reduce((acc, curr) => acc + (curr.peopleImpacted || 0), 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default MapPane;
