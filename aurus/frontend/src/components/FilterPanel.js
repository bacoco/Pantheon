import React, { useState } from 'react';

const FilterPanel = ({ metrics = [], onFilter, activeFilters }) => {
  const [filters, setFilters] = useState([]);
  const [logic, setLogic] = useState('AND');

  const operators = ['>', '<', '>=', '<=', '='];
  
  const presets = [
    { name: 'Value Stocks', id: 'value_stocks' },
    { name: 'Growth Stocks', id: 'growth_stocks' },
    { name: 'Dividend Champions', id: 'quality_dividend' },
    { name: 'Financial Health', id: 'financially_healthy' },
  ];

  const addFilter = () => {
    setFilters([...filters, { metric: '', operator: '>', value: '' }]);
  };

  const updateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const applyFilters = () => {
    const criteria = {};
    filters.forEach(filter => {
      if (filter.metric && filter.value) {
        criteria[filter.metric] = {
          operator: filter.operator,
          value: parseFloat(filter.value)
        };
      }
    });
    criteria.logic = logic;
    onFilter(criteria);
  };

  const clearFilters = () => {
    setFilters([]);
    onFilter({});
  };

  const loadPreset = async (presetId) => {
    // In a real app, fetch preset from backend
    // For now, using hardcoded presets
    const presetFilters = {
      value_stocks: [
        { metric: 'pe_ratio', operator: '<', value: '15' },
        { metric: 'dividend_yield', operator: '>', value: '0.03' }
      ],
      growth_stocks: [
        { metric: 'revenue_growth', operator: '>', value: '0.15' },
        { metric: 'earnings_growth', operator: '>', value: '0.15' }
      ],
      quality_dividend: [
        { metric: 'dividend_yield', operator: '>', value: '0.02' },
        { metric: 'payout_ratio', operator: '<', value: '0.6' },
        { metric: 'roe', operator: '>', value: '0.15' }
      ],
      financially_healthy: [
        { metric: 'current_ratio', operator: '>', value: '1.5' },
        { metric: 'debt_to_equity', operator: '<', value: '0.5' },
        { metric: 'roe', operator: '>', value: '0.1' }
      ]
    };
    
    setFilters(presetFilters[presetId] || []);
    setLogic('AND');
  };

  return (
    <div className="filter-panel">
      <h3>Stock Screening</h3>
      
      <div className="presets">
        <h4>Quick Filters</h4>
        {presets.map(preset => (
          <button 
            key={preset.id}
            onClick={() => loadPreset(preset.id)}
            className="preset-btn"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="custom-filters">
        <h4>Custom Filters</h4>
        
        <div className="logic-selector">
          <label>
            <input
              type="radio"
              value="AND"
              checked={logic === 'AND'}
              onChange={(e) => setLogic(e.target.value)}
            />
            Match ALL criteria (AND)
          </label>
          <label>
            <input
              type="radio"
              value="OR"
              checked={logic === 'OR'}
              onChange={(e) => setLogic(e.target.value)}
            />
            Match ANY criteria (OR)
          </label>
        </div>

        {filters.map((filter, index) => (
          <div key={index} className="filter-row">
            <select
              value={filter.metric}
              onChange={(e) => updateFilter(index, 'metric', e.target.value)}
            >
              <option value="">Select metric...</option>
              {metrics.map(metric => (
                <option key={metric} value={metric}>
                  {metric.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
            
            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
            >
              {operators.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            
            <input
              type="number"
              step="0.01"
              value={filter.value}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              placeholder="Value"
            />
            
            <button onClick={() => removeFilter(index)} className="remove-btn">
              ✕
            </button>
          </div>
        ))}
        
        <button onClick={addFilter} className="add-filter-btn">
          + Add Filter
        </button>
      </div>

      <div className="filter-actions">
        <button onClick={applyFilters} className="apply-btn">
          Apply Filters
        </button>
        <button onClick={clearFilters} className="clear-btn">
          Clear All
        </button>
      </div>
      
      {Object.keys(activeFilters).length > 0 && (
        <div className="active-filters">
          <h4>Active Filters</h4>
          <pre>{JSON.stringify(activeFilters, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;