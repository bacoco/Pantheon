import React, { useState, useEffect } from 'react';
import StockGrid from './components/StockGrid';
import FilterPanel from './components/FilterPanel';
import UpdatePanel from './components/UpdatePanel';
import ExportPanel from './components/ExportPanel';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    // Load initial data
    fetchStocks();
    fetchMetrics();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stocks');
      const data = await response.json();
      setStocks(data);
      setFilteredStocks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stocks/metrics/available');
      const data = await response.json();
      setMetrics(data.metrics || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Set default metrics if the API call fails
      setMetrics([
        'pe_ratio', 'dividend_yield', 'roe', 'revenue_growth',
        'earnings_growth', 'debt_to_equity', 'current_ratio',
        'beta', 'payout_ratio', 'operating_margin'
      ]);
    }
  };

  const handleFilter = async (criteria) => {
    setActiveFilters(criteria);
    
    if (Object.keys(criteria).length === 0) {
      setFilteredStocks(stocks);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/stocks/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      });
      const data = await response.json();
      setFilteredStocks(data);
    } catch (error) {
      console.error('Error filtering stocks:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Aurus - SBF 250 Portfolio Analyzer</h1>
        <div className="stats">
          Showing {filteredStocks.length} of {stocks.length} stocks
        </div>
      </header>
      
      <div className="App-body">
        <aside className="sidebar">
          <UpdatePanel onUpdate={fetchStocks} />
          <FilterPanel 
            metrics={metrics}
            onFilter={handleFilter}
            activeFilters={activeFilters}
          />
          <ExportPanel 
            activeFilters={activeFilters}
            metrics={metrics}
          />
        </aside>
        
        <main className="main-content">
          {loading ? (
            <div className="loading">Loading stocks...</div>
          ) : (
            <StockGrid stocks={filteredStocks} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;