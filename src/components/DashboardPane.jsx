import React, { useState } from 'react';
import { Activity, AlertTriangle, MapPin, Navigation, Send, RefreshCw, Layers, CheckCircle, Image as ImageIcon, X, Link, FileText, UserCheck } from 'lucide-react';
import { sampleTweets } from '../services/mockLLM';

const DashboardPane = ({ 
  appMode,
  setAppMode,
  rawText, 
  setRawText,
  onProcess,
  isProcessing, 
  incidents,
  totalIncidents,
  onResolve,
  onClaim,
  urgencyFilter,
  setUrgencyFilter,
  typeFilter,
  setTypeFilter,
  uniqueTypes
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null); // For image modal

  const handleLoadDemo = () => {
    setRawText(sampleTweets);
  };

  const handleClear = () => {
    setRawText('');
    setSelectedImage(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setSelectedImage(url);
    }
  };

  return (
    <div className="sidebar">
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setFullscreenImage(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={32} />
          </button>
          <img src={fullscreenImage} alt="Fullscreen detail" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
        </div>
      )}

      <div style={{ background: 'var(--accent-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', padding: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        AI + Human Coordination for Disaster Response
      </div>

      <div className="header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers className="header-icon" size={28} />
          <div>
            <h1>CrisisMapper</h1>
            <p>Real-time Response Coordination</p>
          </div>
        </div>
        
        {/* Mode Toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button 
            onClick={() => setAppMode('responder')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', border: 'none', cursor: 'pointer', background: appMode === 'responder' ? 'var(--bg-surface-hover)' : 'var(--bg-base)', color: appMode === 'responder' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: appMode === 'responder' ? 'bold' : 'normal' }}
          >
            Responder
          </button>
          <button 
            onClick={() => setAppMode('volunteer')}
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', border: 'none', cursor: 'pointer', background: appMode === 'volunteer' ? 'var(--bg-surface-hover)' : 'var(--bg-base)', color: appMode === 'volunteer' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: appMode === 'volunteer' ? 'bold' : 'normal', borderLeft: '1px solid var(--border-light)' }}
          >
            Volunteer
          </button>
        </div>
      </div>

      {appMode === 'responder' && (
        <div className="input-section">
        <div className="section-title">
          <span>Social Media Ingestion Stream</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 2s infinite' }}></div>
              Live Mode Ready
            </span>
          </div>
        </div>
        
        <div className="demo-actions">
          <button className="demo-btn" onClick={handleLoadDemo}>
            Load Demo Data (Chennai)
          </button>
          <button className="demo-btn" onClick={handleClear}>
            Clear
          </button>
        </div>

        <div className="textarea-container">
          <textarea 
            placeholder="Paste raw text, distress messages, or links to social media posts (e.g., https://twitter.com/...)"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isProcessing}
          />
          
          {selectedImage && (
            <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
              <img src={selectedImage} alt="Uploaded preview" style={{ height: '80px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--status-critical)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-start' }}>
            <label className="demo-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
              <ImageIcon size={14} /> Attach Screenshot
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <button 
          className="btn btn-primary process-btn" 
          onClick={() => {
            onProcess(rawText, selectedImage);
            setSelectedImage(null); // Clear after processing
          }}
          disabled={isProcessing || rawText.trim().length === 0}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="spinner" size={18} />
              Extracting Structured Data...
            </>
          ) : (
            <>
              <Send size={18} />
              Process Stream via AI
            </>
          )}
        </button>
      </div>
      )}

      <div className="feed-section">
        <div className="section-title" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <span>Extracted Intel Feed</span>
          {totalIncidents > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
              <select 
                value={urgencyFilter} 
                onChange={e => setUrgencyFilter(e.target.value)}
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="All">All Urgencies</option>
                <option value="Critical">Critical</option>
                <option value="Urgent">Urgent</option>
                <option value="Stable">Stable</option>
              </select>
              
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
              >
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Needs' : type}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {totalIncidents === 0 && !isProcessing && (
          <div className="empty-state animate-slide-in">
            <Activity size={48} opacity={0.2} />
            <p>Waiting for data ingestion.<br/>Paste raw text above to extract insights.</p>
          </div>
        )}

        {isProcessing && totalIncidents === 0 && (
          <div className="processing-indicator animate-slide-in">
            <RefreshCw className="spinner" size={24} />
            <span>AI Model running inference...</span>
          </div>
        )}

        {totalIncidents > 0 && incidents.length === 0 && (
          <div className="empty-state animate-slide-in" style={{ padding: '2rem 0' }}>
            <p>No incidents match the current filters.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {incidents.map((incident, index) => (
            <div 
              key={incident.id} 
              className="card animate-slide-in"
              style={{ animationDelay: (index * 0.1) + 's', opacity: incident.resolved ? 0.5 : 1 }}
            >
              <div className="card-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={"badge badge-" + incident.urgencyLabel.toLowerCase()}>
                      {incident.urgencyLabel === 'Critical' && <AlertTriangle size={12} />}
                      {incident.urgencyLabel} ({incident.urgency}/5)
                    </span>
                    <span style={{ fontSize: '0.7rem', color: incident.confidence >= 90 ? 'var(--status-stable)' : 'var(--status-urgent)' }}>
                      {incident.confidence}% AI Conf
                    </span>
                  </div>
                  {incident.source && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.2rem', textTransform: 'uppercase' }}>
                      {incident.source === 'Link' ? <Link size={10} /> : incident.source === 'Screenshot' ? <ImageIcon size={10} /> : <FileText size={10} />}
                      Source: {incident.source}
                    </div>
                  )}
                </div>
                <span className="card-type">
                  <Navigation size={12} />
                  {incident.needType}
                </span>
              </div>
              <div className="card-text">
                "{incident.text}"
              </div>
              {incident.imageUrl && (
                <div style={{ margin: '0.5rem 0', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(incident.imageUrl)}>
                  <img src={incident.imageUrl} alt="Incident media thumbnail" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }} />
                </div>
              )}
              <div className="card-location">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} color="var(--accent-primary)" />
                  {incident.location}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Navigation size={12} />
                  Approximate distance: {incident.distanceKm} km
                </div>
              </div>
              
              {!incident.resolved && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {appMode === 'volunteer' && !incident.claimed && (
                    <button 
                      className="demo-btn" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                      onClick={() => onClaim(incident.id)}
                    >
                      <UserCheck size={14} /> I can help
                    </button>
                  )}
                  {incident.claimed && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}>
                      <UserCheck size={14} /> Claimed by you
                    </span>
                  )}
                  <button 
                    className="demo-btn" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--status-stable)', borderColor: 'var(--status-stable)' }}
                    onClick={() => onResolve(incident.id)}
                  >
                    <CheckCircle size={14} /> Mark as Resolved
                  </button>
                </div>
              )}
              {incident.resolved && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', color: 'var(--text-tertiary)', fontSize: '0.75rem', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={14} /> Resolved
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPane;
