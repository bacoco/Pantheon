# 🔧 Rate Limit Fix Guide

## Current Issue
Yahoo Finance is returning 429 (Too Many Requests) errors. This happens when fetching data too quickly.

## Solutions Applied

### 1. ✅ Increased Rate Limit Delay
- Changed from 0.5 seconds to 2.0 seconds between requests
- This will make updates take longer (~8-10 minutes) but should avoid rate limits

### 2. ✅ Added Retry Endpoint
- New endpoint: `POST /api/stocks/update/failed`
- Retries only the stocks that failed previously

## Recommended Steps

### Option A: Clear and Restart (Quickest)
```bash
# Stop the backend (Ctrl+C)
# Clear the database
cd /Users/loic/develop/BACO/aurus/backend
rm aurus.db

# Restart the backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Then in the web app:
1. Click "Update All Data"
2. Be patient - it will take ~8-10 minutes with the new delay
3. Monitor progress in the UI

### Option B: Retry Failed Stocks Only
If you want to keep existing data and just retry failed stocks:

```bash
# Check how many stocks failed
curl -X GET http://localhost:8000/api/stocks | jq '[.[] | select(.update_status == "failed")] | length'

# Retry only failed stocks
curl -X POST http://localhost:8000/api/stocks/update/failed
```

### Option C: Update Individual Stocks
Update specific stocks one at a time:

```bash
# Create a single stock update endpoint (if needed)
curl -X POST http://localhost:8000/api/stocks/CS.PA/update
```

## Alternative Solutions

### 1. Use a VPN
If you continue getting rate limited, try using a VPN to get a different IP address.

### 2. Update in Batches
Update stocks in smaller batches throughout the day:
- Morning: Update A-H tickers
- Afternoon: Update I-P tickers  
- Evening: Update Q-Z tickers

### 3. Use Different Data Source
Consider alternative data sources like:
- Alpha Vantage API (requires free API key)
- IEX Cloud (requires API key)
- Financial Modeling Prep (requires API key)

## Monitoring Rate Limits

To see which stocks failed:
```bash
# Get all failed stocks
curl -X GET http://localhost:8000/api/stocks | \
  jq '.[] | select(.update_status == "failed") | {ticker, error_message}'
```

## Expected Timeline

With 2-second delay:
- 250 stocks × 2 seconds = 500 seconds = ~8.3 minutes
- Add processing time = ~10 minutes total

## Tips

1. **Don't run multiple updates simultaneously** - This will cause more rate limiting
2. **Wait between retry attempts** - Give Yahoo Finance time to reset limits
3. **Update during off-peak hours** - Early morning or late evening might have looser limits
4. **Consider caching** - Once data is loaded, it's cached in SQLite

The app will still work with partial data - you can use filters and export whatever stocks loaded successfully!