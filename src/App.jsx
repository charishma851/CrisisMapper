import React, { useState, useMemo } from 'react';
import DashboardPane from './components/DashboardPane';
import MapPane from './components/MapPane';
import { processRawText } from './services/mockLLM';
import './App.css';

function App() {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [incidents, setIncidents] = useState([]);

  // Mock user location for distance calculations (e.g., Volunteer in Chennai)
  const [userLocation] = useState({ lat: 13.0, lng: 80.2 });

  // Mode & Role
  const [appMode, setAppMode] = useState('responder'); // 'responder' | 'volunteer'

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const handleProcessText = async (text, imageUrl = null) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setIncidents([]); // Clear previous incidents for the live demo effect
    
    try {
      // Simulate API call to Claude
      const extractedData = await processRawText(text);
      
      // Determine source
      let source = 'Text';
      if (imageUrl) source = 'Screenshot';
      else if (text.trim().startsWith('http')) source = 'Link';

      if (extractedData.length > 0) {
        if (imageUrl) extractedData[0].imageUrl = imageUrl;
        extractedData.forEach(inc => inc.source = source);
      }
      
      // Simulate a live stream of data arriving sequentially
      extractedData.forEach((incident, index) => {
        setTimeout(() => {
          setIncidents(prevIncidents => [incident, ...prevIncidents]);
          
          // Stop the processing spinner after the last item is loaded
          if (index === extractedData.length - 1) {
            setIsProcessing(false);
          }
        }, index * 1200); // 1.2 seconds between each incoming incident
      });
      
    } catch (error) {
      console.error("Error processing data:", error);
      setIsProcessing(false);
    }
  };

  const handleResolve = (id) => {
    setIncidents(prevIncidents => 
      prevIncidents.map(incident => 
        incident.id === id ? { ...incident, resolved: true } : incident
      )
    );
  };

  const handleClaim = (id) => {
    setIncidents(prevIncidents => 
      prevIncidents.map(incident => 
        incident.id === id ? { ...incident, claimed: true } : incident
      )
    );
  };

  const uniqueTypes = useMemo(() => {
    return ['All', ...new Set(incidents.map(inc => inc.needType))];
  }, [incidents]);

  // Haversine distance formula
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Volunteer mode default filtering (show unassigned, meaning not resolved and not claimed by OTHERS. 
      // For simplicity, we just show everything but sort or visually distinguish them).
      // Wait, let's just let the filters do their job, but maybe volunteers only want to see things that are open.
      if (appMode === 'volunteer' && inc.resolved) return false;
      
      const matchUrgency = urgencyFilter === 'All' || inc.urgencyLabel === urgencyFilter;
      const matchType = typeFilter === 'All' || inc.needType === typeFilter;
      return matchUrgency && matchType;
    }).map(inc => ({
      ...inc,
      distanceKm: getDistance(userLocation.lat, userLocation.lng, inc.lat, inc.lng).toFixed(1)
    }));
  }, [incidents, urgencyFilter, typeFilter, userLocation]);

  return (
    <div className="app-container">
      <DashboardPane 
        appMode={appMode}
        setAppMode={setAppMode}
        rawText={rawText}
        setRawText={setRawText}
        onProcess={handleProcessText}
        isProcessing={isProcessing}
        incidents={filteredIncidents}
        totalIncidents={incidents.length}
        onResolve={handleResolve}
        onClaim={handleClaim}
        urgencyFilter={urgencyFilter}
        setUrgencyFilter={setUrgencyFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        uniqueTypes={uniqueTypes}
      />
      <MapPane incidents={filteredIncidents} userLocation={userLocation} />
    </div>
  );
}

export default App;
