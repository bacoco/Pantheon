import React, { useState, useEffect } from 'react';

const UpdatePanel = ({ onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, ticker: '' });

  useEffect(() => {
    if (updating) {
      const interval = setInterval(checkProgress, 1000);
      return () => clearInterval(interval);
    }
  }, [updating]);

  const checkProgress = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stocks/update/progress');
      const data = await response.json();
      setProgress({
        current: data.current,
        total: data.total,
        ticker: data.current_ticker
      });
      
      if (data.status === 'completed') {
        setUpdating(false);
        onUpdate(); // Refresh stock list
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const startUpdate = async () => {
    setUpdating(true);
    try {
      await fetch('http://localhost:8000/api/stocks/update', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error starting update:', error);
      setUpdating(false);
    }
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className="update-panel">
      <h3>Data Updates</h3>
      
      <button 
        onClick={startUpdate} 
        disabled={updating}
        className="update-btn"
      >
        {updating ? 'Updating...' : 'Update All Data'}
      </button>
      
      {updating && (
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-text">
            {progress.current} / {progress.total} stocks
            {progress.ticker && ` (${progress.ticker})`}
          </div>
          <div className="progress-percent">{progressPercent}%</div>
        </div>
      )}
    </div>
  );
};

export default UpdatePanel;