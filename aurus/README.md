# Aurus - SBF 250 Portfolio Analyzer

A web application for analyzing and screening stocks from the SBF 250 (CAC All-Tradable) index using comprehensive financial metrics from Financial Modeling Prep API.

## Features

- 📊 **Comprehensive Data**: Fetch 40+ financial metrics for all SBF 250 stocks
- 🔍 **Advanced Screening**: Filter stocks with multiple criteria and AND/OR logic
- 📥 **CSV Export**: Export data with European formatting (semicolon delimiter)
- 🔄 **Live Updates**: Refresh market data on demand with progress tracking
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Financial Modeling Prep API key (free tier available)

### 1. Get FMP API Key

1. Register at https://site.financialmodelingprep.com/developer/docs
2. Get your free API key (250 requests/day)
3. Create `.env` file in backend directory:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your FMP_API_KEY
   ```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will open at http://localhost:3000

### 4. First Run

1. Open the web app at http://localhost:3000
2. Click "Update All Data" to fetch SBF 250 stocks (takes ~2-3 minutes)
3. Start screening and analyzing!

## Usage

### Stock Screening

1. **Quick Filters**: Use preset filters like "Value Stocks" or "Growth Stocks"
2. **Custom Filters**: Build your own criteria with any metric
3. **AND/OR Logic**: Combine filters with AND (all must match) or OR (any can match)

### Data Export

1. Choose "Export all columns" or select specific columns
2. Click "Export to CSV"
3. File will download with European Excel formatting

### Example Filters

- **Value Investing**: P/E < 15 AND Dividend Yield > 3%
- **Growth Stocks**: Revenue Growth > 15% AND Earnings Growth > 15%
- **Financial Health**: Current Ratio > 1.5 AND Debt/Equity < 0.5

## Tech Stack

- **Backend**: FastAPI (Python) with SQLAlchemy
- **Frontend**: React with AG-Grid
- **Database**: SQLite (local)
- **Data Source**: yfinance Python library

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
aurus/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Database models
│   │   ├── services/       # Business logic
│   │   └── routers/        # API endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React app
│   │   └── components/     # UI components
│   └── package.json
└── README.md
```

## Development

### Adding New Metrics

1. Add the metric to `Stock` model in `backend/app/models.py`
2. Update `fetch_stock_data` in `yfinance_service.py`
3. The metric will automatically appear in filters

### Customizing Presets

Edit `SCREENING_PRESETS` in `backend/app/sbf250_tickers.py`

## Notes

- Data is cached in SQLite to minimize API calls
- Rate limiting prevents yfinance blocks (500ms between requests)
- European stocks use .PA suffix (Paris exchange)

## License

This is a personal project for investment analysis. Use at your own risk.