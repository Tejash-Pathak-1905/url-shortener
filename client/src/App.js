import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [comment, setComment] = useState('');
  const [shortData, setShortData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [view, setView] = useState('home'); // 'home' | 'analytics' | 'history'
  const [history, setHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [copying, setCopying] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Server Error ${response.status}`);
      return data;
    } else {
      const text = await response.text();
      console.error(`Non-JSON response (Status ${response.status}):`, text.substring(0, 100));
      throw new Error(`Unexpected server response (HTTP ${response.status}). Check backend. Reloading server might help.`);
    }
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/links`);
      const data = await handleResponse(response);
      setHistory(data);
    } catch (err) {
      console.error('History Fetch Error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view, fetchHistory]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: url, comment: comment })
      });
      
      const data = await handleResponse(response);
      setShortData(data);
      setUrl('');
      setComment('');
      
      // Update history in background
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (shortId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/analytics/${shortId}`);
      const data = await handleResponse(response);
      setAnalyticsData(data);
      setView('analytics');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id) => {
    const textToCopy = `${API_BASE}/${id}`;
    navigator.clipboard.writeText(textToCopy);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="app-container">
      <nav>
        <div 
          className={`nav-link ${view === 'home' || view === 'analytics' ? 'active' : ''}`} 
          onClick={() => setView('home')}
        >
          CREATE
        </div>
        <div 
          className={`nav-link ${view === 'history' ? 'active' : ''}`} 
          onClick={() => setView('history')}
        >
          HISTORY
        </div>
      </nav>

      <div className="main-card">
        {view === 'home' ? (
          <>
            <h1 className="header-title">Shrink it.</h1>

            <form className="form-group" onSubmit={handleShorten}>
              <input 
                type="url" 
                className="input-field" 
                placeholder="Url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Private note (optional)" 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '...' : 'Shorten'}
              </button>
            </form>

            {error && <div className="error-bubble">{error}</div>}

            {shortData && (
              <div className="result-box">
                <a 
                  href={`${API_BASE}/${shortData.short_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="short-link-display"
                >
                  {API_BASE}/{shortData.short_id}
                </a>
                <div className="button-row">
                  <button className="btn-mini" style={{padding: '0.6rem 1rem'}} onClick={() => copyToClipboard(shortData.short_id)}>
                    {copying ? 'COPIED' : 'COPY'}
                  </button>
                  <button className="btn-mini" style={{padding: '0.6rem 1rem'}} onClick={() => getAnalytics(shortData.short_id)}>
                    STATS
                  </button>
                </div>
              </div>
            )}
          </>
        ) : view === 'analytics' ? (
          <>
            <h1 className="header-title">Stats</h1>

            <div className="stats-grid">
              <div className="stat-bubble">
                <div className="stat-num">{analyticsData?.clicks}</div>
                <div className="stat-label">Engagements</div>
              </div>
              <div className="stat-bubble">
                <div className="stat-num" style={{fontSize: '1rem'}}>
                  {new Date(analyticsData?.created_at).toLocaleDateString()}
                </div>
                <div className="stat-label">Created</div>
              </div>
            </div>

            {analyticsData?.comment && (
              <div style={{ marginTop: '2.5rem' }}>
                <div className="history-note" style={{ maxWidth: 'none', fontStyle: 'normal', color: 'var(--text-main)' }}>
                  <b>Note:</b> {analyticsData?.comment}
                </div>
              </div>
            )}

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <button className="btn-mini" onClick={() => setView('history')}>
                ← BACK
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="header-title">History</h1>

            {loading && history.length === 0 ? (
              <p style={{ textAlign: 'center', margin: '2rem' }}>...</p>
            ) : error ? (
                <div className="error-bubble">{error}</div>
            ) : history.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '3rem' }}>Empty</p>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th>Note</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <a 
                            href={`${API_BASE}/${item.short_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="history-link"
                          >
                            {API_BASE}/{item.short_id}
                          </a>
                        </td>
                        <td>
                          <div className="history-note">{item.comment || '—'}</div>
                        </td>
                        <td className="history-actions">
                          <button 
                            className="btn-mini" 
                            onClick={() => getAnalytics(item.short_id)}
                          >
                            STATS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <button className="btn-mini" onClick={() => setView('home')}>
                NEW LINK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
