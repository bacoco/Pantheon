import yfinance as yf
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class YFinanceService:
    def __init__(self):
        self.rate_limit_delay = 2.0  # 2 seconds between requests (more conservative)
        # Create custom session with curl user agent to avoid 429 errors
        self.session = requests.Session()
        # Clear default headers and use only curl user agent
        self.session.headers.clear()
        self.session.headers.update({
            'User-Agent': 'curl/7.68.0'
        })
        
    def fetch_stock_data(self, ticker: str) -> Optional[Dict]:
        """Fetch comprehensive data for a single stock"""
        try:
            # Pass custom session to yfinance to use curl headers
            stock = yf.Ticker(ticker, session=self.session)
            info = stock.info
            
            # Extract all available metrics with safe gets
            data = {
                # Identifiers
                'ticker': ticker,
                'name': info.get('longName', info.get('shortName', ticker)),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                
                # Price Data
                'current_price': info.get('currentPrice', info.get('regularMarketPrice')),
                'open_price': info.get('open', info.get('regularMarketOpen')),
                'high_price': info.get('dayHigh', info.get('regularMarketDayHigh')),
                'low_price': info.get('dayLow', info.get('regularMarketDayLow')),
                'close_price': info.get('previousClose'),
                'volume': info.get('volume', info.get('regularMarketVolume')),
                'fifty_two_week_high': info.get('fiftyTwoWeekHigh'),
                'fifty_two_week_low': info.get('fiftyTwoWeekLow'),
                
                # Valuation Metrics
                'market_cap': info.get('marketCap'),
                'enterprise_value': info.get('enterpriseValue'),
                'pe_ratio': info.get('trailingPE'),
                'forward_pe': info.get('forwardPE'),
                'peg_ratio': info.get('pegRatio'),
                'price_to_book': info.get('priceToBook'),
                'price_to_sales': info.get('priceToSalesTrailing12Months'),
                'ev_to_ebitda': info.get('enterpriseToEbitda'),
                'ev_to_revenue': info.get('enterpriseToRevenue'),
                
                # Financial Metrics
                'revenue': info.get('totalRevenue'),
                'revenue_growth': info.get('revenueGrowth'),
                'gross_profit': info.get('grossProfits'),
                'ebitda': info.get('ebitda'),
                'net_income': info.get('netIncomeToCommon'),
                'earnings_growth': info.get('earningsGrowth'),
                
                # Per Share Data
                'eps': info.get('trailingEps'),
                'book_value_per_share': info.get('bookValue'),
                'revenue_per_share': info.get('revenuePerShare'),
                
                # Profitability Ratios
                'gross_margin': info.get('grossMargins'),
                'operating_margin': info.get('operatingMargins'),
                'profit_margin': info.get('profitMargins'),
                'roe': info.get('returnOnEquity'),
                'roa': info.get('returnOnAssets'),
                
                # Financial Health
                'current_ratio': info.get('currentRatio'),
                'quick_ratio': info.get('quickRatio'),
                'debt_to_equity': info.get('debtToEquity'),
                
                # Dividends
                'dividend_yield': info.get('dividendYield'),
                'dividend_rate': info.get('dividendRate'),
                'payout_ratio': info.get('payoutRatio'),
                'ex_dividend_date': info.get('exDividendDate'),
                
                # Technical Indicators
                'beta': info.get('beta'),
                'fifty_day_ma': info.get('fiftyDayAverage'),
                'two_hundred_day_ma': info.get('twoHundredDayAverage'),
                
                # Analyst Data
                'target_price': info.get('targetMeanPrice'),
                'recommendation': info.get('recommendationKey'),
                'number_of_analysts': info.get('numberOfAnalystOpinions'),
                
                # Metadata
                'last_updated': datetime.now(),
                'update_status': 'success',
                'error_message': None
            }
            
            # Clean None values and convert timestamps
            data = {k: v for k, v in data.items() if v is not None}
            
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
            return {
                'ticker': ticker,
                'last_updated': datetime.now(),
                'update_status': 'failed',
                'error_message': str(e)
            }
    
    def fetch_all_sbf250(self, tickers: List[str], progress_callback=None) -> List[Dict]:
        """Fetch data for all SBF 250 stocks with progress tracking"""
        results = []
        total = len(tickers)
        
        for i, ticker in enumerate(tickers):
            # Progress callback
            if progress_callback:
                progress_callback(i + 1, total, ticker)
            
            # Fetch data
            data = self.fetch_stock_data(ticker)
            if data:
                results.append(data)
            
            # Rate limiting
            time.sleep(self.rate_limit_delay)
            
        return results