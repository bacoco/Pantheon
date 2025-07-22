---
version: 1.0
project_type: "Web Application - Financial Portfolio Analyzer"
author: "Loic"
created_at: "2025-01-21"
tech_stack:
  frontend: "React"
  backend: "FastAPI"
  database: "SQLite"
  deployment: "Local"
---

## FEATURE: SBF 250 Comprehensive Data Collection

[HIGH PRIORITY] Fetch and store comprehensive financial data for all stocks in the SBF 250 (CAC All-Tradable) index using the yfinance Python library.

The system should retrieve ALL available metrics from yfinance including:
- Price data (current, open, close, high, low, volume, 52-week high/low)
- Valuation metrics (P/E, Forward P/E, PEG, P/B, P/S, EV/EBITDA, EV/Revenue)
- Financial metrics (Market Cap, Enterprise Value, Revenue, EBITDA, Net Income)
- Per-share data (EPS, Book Value per Share, Revenue per Share)
- Profitability ratios (ROE, ROA, Gross Margin, Operating Margin, Profit Margin)
- Liquidity ratios (Current Ratio, Quick Ratio, Debt/Equity)
- Growth metrics (Revenue Growth, Earnings Growth, Quarterly Revenue Growth)
- Dividend information (Dividend Yield, Payout Ratio, Dividend Date, Ex-Dividend Date)
- Analyst data (Target Price, Number of Analysts, Recommendations)
- Technical indicators (Beta, 50-day MA, 200-day MA)

Implementation notes:
- Use `.PA` suffix for Paris-listed stocks (e.g., "TTE.PA" for TotalEnergies)
- Implement error handling for missing data fields
- Add progress tracking for fetching 250 stocks
- Cache results in SQLite to minimize API calls
- Include rate limiting delays between requests

## FEATURE: Stock Screening and Filtering

[HIGH PRIORITY] Provide powerful screening capabilities to filter SBF 250 stocks based on any combination of metrics.

Requirements:
- Filter by any numerical metric using operators (>, <, =, >=, <=, between)
- Support multiple criteria with AND/OR logic
- Pre-built screening templates (e.g., "Value Stocks", "Growth Stocks", "Dividend Champions")
- Save custom screening criteria for reuse
- Sort results by any metric
- Display filtered results in a responsive data grid
- Show count of stocks matching criteria

Example screening criteria:
- P/E < 15 AND Dividend Yield > 3%
- Market Cap > 10B AND ROE > 15%
- Revenue Growth > 10% AND Debt/Equity < 0.5

Dependencies: SBF 250 Comprehensive Data Collection

## FEATURE: CSV Export Functionality

[HIGH PRIORITY] Export stock data to CSV format for external analysis.

Requirements:
- Export full dataset (all 250 stocks with all metrics)
- Export filtered results based on active screening criteria
- Customizable column selection
- Include metadata in export (timestamp, applied filters, data source)
- Proper formatting for Excel compatibility
- Handle special characters and European number formats
- File naming convention: aurus_sbf250_export_YYYYMMDD_HHMMSS.csv

Export options:
- Full export: All stocks, all columns
- Filtered export: Only stocks matching current screen
- Custom export: User-selected columns only

Dependencies: SBF 250 Comprehensive Data Collection, Stock Screening and Filtering

## FEATURE: On-Demand Data Updates

[MEDIUM PRIORITY] Allow users to refresh market data on demand to ensure analysis uses latest information.

Requirements:
- "Update All Data" button in the UI
- Update individual stock data
- Show last update timestamp for each stock
- Progress bar during update process
- Handle failed updates gracefully (retry logic)
- Differential updates (only fetch changed data if possible)
- Update status indicators (success/failed/pending)
- Estimated time remaining during bulk updates

Implementation:
- Store last update timestamp in SQLite
- Implement smart caching (update only if data is older than X hours)
- Queue system for update requests
- Cancel update operation support

Dependencies: SBF 250 Comprehensive Data Collection

## EXAMPLES:

- `https://github.com/ranaroussi/yfinance`: Official yfinance library documentation and examples
- `https://ranaroussi.github.io/yfinance`: yfinance API reference documentation

## DOCUMENTATION:

- `https://github.com/ranaroussi/yfinance`: yfinance Python library for Yahoo Finance data
- `https://fastapi.tiangolo.com/`: FastAPI framework documentation
- `https://react.dev/`: React official documentation
- `https://www.sqlite.org/docs.html`: SQLite documentation
- `https://pypi.org/project/yfinance/`: yfinance package on PyPI

## CONSTRAINTS:

- Must handle yfinance rate limiting (implement delays between requests)
- European stocks use `.PA` suffix for Paris exchange
- Some SBF 250 constituents may have limited data availability
- SQLite database for local storage only (no cloud sync)
- Weekend project scope - focus on core functionality
- All data retrieval must handle missing fields gracefully
- Cache data to minimize redundant API calls
- No user authentication needed (personal use only)

## OTHER CONSIDERATIONS:

- This is a personal investment tool for annual portfolio rebalancing
- Focus on long-term investment metrics rather than day-trading indicators
- UI should be clean and focused on data presentation
- Consider adding a "Favorites" feature for tracking specific stocks
- Future enhancement: Portfolio optimization algorithms (Modern Portfolio Theory)
- Data freshness: Daily updates should be sufficient for long-term investing
- Consider implementing data persistence between sessions
- Add tooltips explaining financial metrics for educational purposes