# 🚀 Financial Modeling Prep (FMP) Setup Guide

## Step 1: Get Your Free FMP API Key

1. **Register at FMP**: https://site.financialmodelingprep.com/developer/docs
2. **Sign up** for a free account
3. **Verify your email**
4. **Get your API key** from the dashboard
5. **Free tier includes**: 250 API calls per day

## Step 2: Configure Your Environment

1. **Copy the example env file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit .env file** and add your API key:
   ```
   FMP_API_KEY=your_actual_api_key_here
   ```

## Step 3: Install Dependencies

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 4: Test FMP Connection

```bash
cd backend
python3 -c "
from app.services.fmp_service import FMPService
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('FMP_API_KEY')
if api_key:
    service = FMPService(api_key)
    data = service.fetch_stock_data('TTE.PA')
    if data and data.get('update_status') == 'success':
        print('✅ FMP connection successful!')
        print(f\"Stock: {data['name']}\")
        print(f\"Price: €{data['current_price']}\")
    else:
        print('❌ Failed to fetch data')
        print(data.get('error_message'))
else:
    print('❌ FMP_API_KEY not found in .env file')
"
```

## Step 5: Run the Application

1. **Clear old database** (optional):
   ```bash
   rm backend/aurus.db
   ```

2. **Start the application**:
   ```bash
   cd /Users/loic/develop/BACO/aurus
   ./start.sh
   ```

3. **In the web app**:
   - Click "Update All Data"
   - Monitor progress (will take ~2-3 minutes for 250 stocks)
   - Use filters to analyze stocks

## 📊 What FMP Provides

The free tier includes access to:
- ✅ **Real-time prices** for all major exchanges
- ✅ **P/E ratios** and valuation metrics
- ✅ **Market capitalization**
- ✅ **Dividend yields** and payout ratios
- ✅ **Financial ratios** (ROE, debt/equity, etc.)
- ✅ **Revenue and earnings** data
- ✅ **52-week highs/lows**
- ✅ **Moving averages**
- ✅ **Target prices** and analyst ratings

## 🔍 Troubleshooting

### "Invalid API KEY" Error
- Make sure you've registered and verified your email
- Check that the API key is correctly copied to .env
- Ensure no extra spaces in the API key

### Rate Limiting
- Free tier: 250 calls/day
- Each stock update uses ~4 API calls
- You can update ~60 stocks per day on free tier
- For all 250 stocks, consider upgrading or spreading updates

### French Stocks Not Found
- Use the exact ticker format: `TTE.PA`, `BNP.PA`, etc.
- The `.PA` suffix is required for Paris exchange

## 💡 Tips

1. **Cache data**: Once loaded, data persists in SQLite
2. **Selective updates**: Update only specific stocks to save API calls
3. **Batch updates**: Update in groups throughout the week
4. **Monitor usage**: Check your API usage on FMP dashboard

## 🎉 Success!

With FMP integrated, you now have access to comprehensive financial data for all SBF 250 stocks, enabling full portfolio analysis capabilities!