import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const StockGrid = ({ stocks }) => {
  const [gridApi, setGridApi] = useState(null);

  // Formatters for European number display
  const priceFormatter = (params) => {
    if (params.value == null) return '';
    return params.value.toFixed(2).replace('.', ',') + ' €';
  };

  const percentFormatter = (params) => {
    if (params.value == null) return '';
    return (params.value * 100).toFixed(2).replace('.', ',') + '%';
  };

  const ratioFormatter = (params) => {
    if (params.value == null) return '';
    return params.value.toFixed(2).replace('.', ',');
  };

  const largeNumberFormatter = (params) => {
    if (params.value == null) return '';
    if (params.value >= 1e9) {
      return (params.value / 1e9).toFixed(2).replace('.', ',') + ' B€';
    }
    return (params.value / 1e6).toFixed(2).replace('.', ',') + ' M€';
  };

  const columnDefs = useMemo(() => [
    { field: 'ticker', headerName: 'Ticker', pinned: 'left', width: 80 },
    { field: 'name', headerName: 'Company', pinned: 'left', width: 200 },
    { field: 'sector', headerName: 'Sector', width: 150 },
    { field: 'current_price', headerName: 'Price (€)', valueFormatter: priceFormatter },
    { field: 'market_cap', headerName: 'Market Cap', valueFormatter: largeNumberFormatter },
    { field: 'pe_ratio', headerName: 'P/E', valueFormatter: ratioFormatter },
    { field: 'dividend_yield', headerName: 'Div Yield', valueFormatter: percentFormatter },
    { field: 'roe', headerName: 'ROE', valueFormatter: percentFormatter },
    { field: 'revenue_growth', headerName: 'Rev Growth', valueFormatter: percentFormatter },
    { field: 'debt_to_equity', headerName: 'D/E Ratio', valueFormatter: ratioFormatter },
    { field: 'current_ratio', headerName: 'Current Ratio', valueFormatter: ratioFormatter },
    { field: 'beta', headerName: 'Beta', valueFormatter: ratioFormatter },
    { field: 'target_price', headerName: 'Target (€)', valueFormatter: priceFormatter },
    { field: 'recommendation', headerName: 'Rating', width: 100 },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        rowData={stocks}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={(params) => setGridApi(params.api)}
        animateRows={true}
        rowSelection="multiple"
      />
    </div>
  );
};

export default StockGrid;