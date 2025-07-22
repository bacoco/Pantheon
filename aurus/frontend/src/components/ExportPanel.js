import React, { useState } from 'react';

const ExportPanel = ({ activeFilters, metrics = [] }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectAll, setSelectAll] = useState(true);

  const handleExport = async () => {
    const params = new URLSearchParams();
    
    if (!selectAll && selectedColumns.length > 0) {
      params.append('columns', selectedColumns.join(','));
    }
    
    const url = 'http://localhost:8000/api/export/csv?' + params.toString();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters: activeFilters })
      });
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `aurus_sbf250_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const toggleColumn = (metric) => {
    if (selectedColumns.includes(metric)) {
      setSelectedColumns(selectedColumns.filter(m => m !== metric));
    } else {
      setSelectedColumns([...selectedColumns, metric]);
    }
  };

  return (
    <div className="export-panel">
      <h3>Export Data</h3>
      
      <div className="export-options">
        <label>
          <input
            type="radio"
            checked={selectAll}
            onChange={() => setSelectAll(true)}
          />
          Export all columns
        </label>
        
        <label>
          <input
            type="radio"
            checked={!selectAll}
            onChange={() => setSelectAll(false)}
          />
          Select columns
        </label>
      </div>
      
      {!selectAll && (
        <div className="column-selector">
          {metrics.map(metric => (
            <label key={metric}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(metric)}
                onChange={() => toggleColumn(metric)}
              />
              {metric.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      )}
      
      <button onClick={handleExport} className="export-btn">
        Export to CSV
      </button>
      
      {Object.keys(activeFilters).length > 0 && (
        <p className="export-note">
          Export will include only filtered results
        </p>
      )}
    </div>
  );
};

export default ExportPanel;