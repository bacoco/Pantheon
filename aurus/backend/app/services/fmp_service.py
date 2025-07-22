import requests
import time
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class FMPService:
    """Financial Modeling Prep API Service for fetching stock data"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or "YOUR_FMP_API_KEY"  # Replace with actual key
        self.base_url = "https://financialmodelingprep.com/api/v3"
        self.rate_limit_delay = 0.5  # 500ms between requests
        
    def _make_request(self, endpoint: str) -> Optional[Dict]:
        """Make a request to FMP API with error handling"""
        url = f"{self.base_url}/{endpoint}"
        params = {"apikey": self.api_key}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"FMP API error {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"FMP request error: {str(e)}")
            return None
    
    def fetch_stock_data(self, ticker: str) -> Optional[Dict]:
        """Fetch comprehensive data for a single stock"""
        try:
            # Get company profile (includes current price, market cap)
            profile_data = self._make_request(f"profile/{ticker}")
            if not profile_data or not isinstance(profile_data, list) or len(profile_data) == 0:
                logger.error(f"No profile data for {ticker}")
                return {
                    'ticker': ticker,
                    'last_updated': datetime.now(),
                    'update_status': 'failed',
                    'error_message': 'No profile data available'
                }
            
            profile = profile_data[0]
            
            # Get key metrics (P/E ratio, dividends, etc.)
            metrics_data = self._make_request(f"key-metrics/{ticker}?limit=1")
            metrics = metrics_data[0] if metrics_data and len(metrics_data) > 0 else {}
            
            # Get financial ratios
            ratios_data = self._make_request(f"ratios/{ticker}?limit=1")
            ratios = ratios_data[0] if ratios_data and len(ratios_data) > 0 else {}
            
            # Get income statement for revenue data
            income_data = self._make_request(f"income-statement/{ticker}?limit=1")
            income = income_data[0] if income_data and len(income_data) > 0 else {}
            
            # Map FMP data to our schema
            stock_data = {
                # Identifiers
                'ticker': ticker,
                'name': profile.get('companyName'),
                'sector': profile.get('sector'),
                'industry': profile.get('industry'),
                
                # Price Data
                'current_price': profile.get('price'),
                'open_price': profile.get('dayLow'),  # FMP doesn't provide open in profile
                'high_price': profile.get('dayHigh'),
                'low_price': profile.get('dayLow'),
                'close_price': profile.get('previousClose'),
                'volume': profile.get('volAvg'),
                
                # 52-week data
                'fifty_two_week_high': profile.get('yearHigh'),
                'fifty_two_week_low': profile.get('yearLow'),
                
                # Market Data
                'market_cap': profile.get('mktCap'),
                'enterprise_value': metrics.get('enterpriseValue'),
                
                # Valuation Ratios
                'pe_ratio': metrics.get('peRatio') or profile.get('pe'),
                'forward_pe': metrics.get('forwardPE'),
                'peg_ratio': metrics.get('pegRatio'),
                'price_to_book': metrics.get('pbRatio') or profile.get('priceToBook'),
                'price_to_sales': metrics.get('priceToSalesRatio'),
                'ev_to_ebitda': metrics.get('evToEbitda'),
                'ev_to_revenue': metrics.get('evToRevenue'),
                
                # Financial Metrics
                'revenue': income.get('revenue'),
                'revenue_growth': metrics.get('revenueGrowth'),
                'gross_profit': income.get('grossProfit'),
                'ebitda': income.get('ebitda'),
                'net_income': income.get('netIncome'),
                'earnings_growth': metrics.get('earningsGrowth'),
                
                # Per Share Data
                'eps': income.get('eps') or profile.get('eps'),
                'book_value_per_share': metrics.get('bookValuePerShare'),
                'revenue_per_share': metrics.get('revenuePerShare'),
                
                # Profitability Ratios
                'gross_margin': income.get('grossProfitRatio'),
                'operating_margin': income.get('operatingIncomeRatio'),
                'profit_margin': income.get('netIncomeRatio'),
                'roe': metrics.get('roe'),
                'roa': metrics.get('returnOnAssets'),
                
                # Financial Health
                'current_ratio': ratios.get('currentRatio'),
                'quick_ratio': ratios.get('quickRatio'),
                'debt_to_equity': ratios.get('debtEquityRatio'),
                
                # Dividend Data
                'dividend_yield': metrics.get('dividendYield'),
                'dividend_rate': None,  # Not directly available
                'payout_ratio': ratios.get('payoutRatio'),
                'ex_dividend_date': None,  # Would need separate endpoint
                
                # Other
                'beta': profile.get('beta'),
                'fifty_day_ma': profile.get('priceAvg50'),
                'two_hundred_day_ma': profile.get('priceAvg200'),
                'target_price': profile.get('targetPrice'),
                'recommendation': profile.get('rating'),
                'number_of_analysts': None,  # Would need separate endpoint
                
                # Status
                'last_updated': datetime.now(),
                'update_status': 'success',
                'error_message': None
            }
            
            logger.info(f"Successfully fetched FMP data for {ticker}")
            return stock_data
            
        except Exception as e:
            logger.error(f"Error fetching FMP data for {ticker}: {str(e)}")
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
            if i < total - 1:  # Don't delay after last ticker
                time.sleep(self.rate_limit_delay)
            
        return results