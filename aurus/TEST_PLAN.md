# Aurus - Integration Test Plan

## 🚀 Quick Start

1. Run the application:
   ```bash
   ./start.sh
   ```

2. Open http://localhost:3000 in your browser

## 📋 Test Checklist

### 1. Initial Setup
- [ ] Backend starts without errors at http://localhost:8000
- [ ] Frontend starts without errors at http://localhost:3000
- [ ] API documentation accessible at http://localhost:8000/docs
- [ ] React app loads with header "Aurus - SBF 250 Analyzer"

### 2. Data Loading
- [ ] Click "Update All Data" button
- [ ] Progress bar appears and shows current stock being updated
- [ ] Progress percentage increases smoothly
- [ ] Update completes in ~2-3 minutes for all 250 stocks
- [ ] Stock grid populates with data after update

### 3. Data Display
- [ ] All stocks show ticker and company name
- [ ] Financial metrics display with European formatting (comma decimals)
- [ ] Prices show with € symbol
- [ ] Market cap shows in M€ or B€ format
- [ ] Columns are sortable (click headers)
- [ ] Columns are resizable (drag column borders)

### 4. Filtering - Preset Filters
- [ ] Click "Value Stocks" - filters to P/E < 15 AND Dividend > 3%
- [ ] Click "Growth Stocks" - filters to revenue/earnings growth > 15%
- [ ] Click "Dividend Champions" - filters dividend stocks
- [ ] Click "Financial Health" - filters healthy balance sheets
- [ ] "Clear All" removes all filters

### 5. Filtering - Custom Filters
- [ ] Add custom filter with "+ Add Filter"
- [ ] Select metric from dropdown (all metrics available)
- [ ] Choose operator (>, <, >=, <=, =)
- [ ] Enter numeric value
- [ ] Apply filter - grid updates
- [ ] Add multiple filters
- [ ] Toggle between AND/OR logic
- [ ] Remove individual filters with ✕ button

### 6. Data Export
- [ ] Click "Export to CSV" with "Export all columns" selected
- [ ] CSV downloads with all data
- [ ] Open CSV in Excel - European format works (semicolon delimiter)
- [ ] Select "Select columns" radio button
- [ ] Choose specific columns to export
- [ ] Export only includes selected columns
- [ ] Export respects active filters (filtered data only)

### 7. Performance Tests
- [ ] Grid handles 250 stocks smoothly
- [ ] Sorting is responsive
- [ ] Filtering updates quickly
- [ ] No browser freezing or lag

### 8. Error Handling
- [ ] Try updating while already updating (should be disabled)
- [ ] Export with no data loaded (should handle gracefully)
- [ ] Invalid filter values (should be prevented by UI)

## 🐛 Common Issues

### Backend won't start
- Check Python version: `python3 --version` (needs 3.8+)
- Try manual install: `cd backend && pip install -r requirements.txt`

### Frontend won't start
- Check Node version: `node --version` (needs 14+)
- Clear cache: `cd frontend && rm -rf node_modules && npm install`

### No data loading
- Check backend logs for yfinance errors
- Verify internet connection
- Check if yfinance is blocked (try VPN)

### Export issues
- Ensure backend CORS is enabled
- Check browser console for errors
- Try different browser

## 📊 Expected Results

After full data load, you should see:
- 250 stocks from SBF 250 index
- Mix of sectors (Technology, Finance, Consumer, etc.)
- Various P/E ratios (some negative, some 10-30 range)
- Market caps from millions to billions
- Mix of dividend yields (0-8%)
- Various growth rates (negative to positive)

## 🎯 Success Criteria

The application is ready for use when:
1. All 250 stocks load successfully
2. All filtering options work correctly
3. Export produces valid European CSV
4. No console errors in browser
5. Performance is smooth with full dataset

## 💡 Usage Tips

1. **First Analysis**: Start with preset filters to understand the data
2. **Deep Dive**: Use custom filters for specific criteria
3. **Export Strategy**: Filter first, then export for focused analysis
4. **Annual Review**: Update all data, apply your criteria, export results

Good luck with your investment analysis! 📈