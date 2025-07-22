import requests
import time
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class FinnhubService:
    """Finnhub API Service for fetching stock data"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://finnhub.io/api/v1"
        self.rate_limit_delay = 1.0  # 1 second between requests (60/minute limit)
        self._eur_usd_rate = None
        self._rate_updated = None
        
    def _clean_symbol(self, ticker: str) -> str:
        """Convert French ticker format (TTE.PA) to Finnhub format (TTE)"""
        return ticker.replace('.PA', '')
    
    def _get_eur_usd_rate(self) -> float:
        """Get EUR/USD exchange rate for currency conversion"""
        # Cache rate for 1 hour
        if self._eur_usd_rate and self._rate_updated:
            if (datetime.now() - self._rate_updated).seconds < 3600:
                return self._eur_usd_rate
        
        try:
            url = f"{self.base_url}/forex/rates"
            params = {"token": self.api_key}
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Get EUR to USD rate
                if 'quote' in data and 'EUR' in data['quote']:
                    self._eur_usd_rate = data['quote']['EUR']
                    self._rate_updated = datetime.now()
                    return self._eur_usd_rate
        except Exception as e:
            logger.warning(f"Could not fetch EUR/USD rate: {e}")
        
        # Default rate if API fails
        return 0.92  # Approximate EUR/USD rate
    
    def _usd_to_eur(self, usd_value: Optional[float]) -> Optional[float]:
        """Convert USD to EUR"""
        if usd_value is None:
            return None
        rate = self._get_eur_usd_rate()
        return usd_value * rate
    
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make a request to Finnhub API with error handling"""
        url = f"{self.base_url}/{endpoint}"
        if params is None:
            params = {}
        params["token"] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Finnhub API error {response.status_code}: {response.text[:200]}")
                return None
        except Exception as e:
            logger.error(f"Finnhub request error: {str(e)}")
            return None
    
    def fetch_stock_data(self, ticker: str) -> Optional[Dict]:
        """Fetch comprehensive data for a single stock"""
        clean_ticker = self._clean_symbol(ticker)
        
        try:
            # Get quote data (current price)
            quote_data = self._make_request("quote", {"symbol": clean_ticker})
            if not quote_data or quote_data.get('c', 0) == 0:
                logger.error(f"No quote data for {clean_ticker}")
                return {
                    'ticker': ticker,
                    'last_updated': datetime.now(),
                    'update_status': 'failed',
                    'error_message': 'No quote data available'
                }
            
            # Get company profile
            profile_data = self._make_request("stock/profile2", {"symbol": clean_ticker})
            profile = profile_data if profile_data else {}
            
            # Get financial metrics
            metrics_data = self._make_request("stock/metric", {"symbol": clean_ticker, "metric": "all"})
            metrics = metrics_data.get('metric', {}) if metrics_data else {}
            
            # Convert USD prices to EUR
            current_price_usd = quote_data.get('c')
            current_price_eur = self._usd_to_eur(current_price_usd)
            
            # Map Finnhub data to our schema
            stock_data = {
                # Identifiers
                'ticker': ticker,
                'name': profile.get('name'),
                'sector': profile.get('finnhubIndustry'),  # Finnhub uses different field
                'industry': profile.get('finnhubIndustry'),
                
                # Price Data (converted to EUR)
                'current_price': current_price_eur,
                'open_price': self._usd_to_eur(quote_data.get('o')),
                'high_price': self._usd_to_eur(quote_data.get('h')),
                'low_price': self._usd_to_eur(quote_data.get('l')),
                'close_price': self._usd_to_eur(quote_data.get('pc')),  # Previous close
                'volume': quote_data.get('v'),  # Volume might not be available
                
                # 52-week data (converted to EUR)
                'fifty_two_week_high': self._usd_to_eur(metrics.get('52WeekHigh')),
                'fifty_two_week_low': self._usd_to_eur(metrics.get('52WeekLow')),
                
                # Market Data (converted to EUR)
                'market_cap': self._usd_to_eur(profile.get('marketCapitalization')) * 1_000_000 if profile.get('marketCapitalization') else None,  # Finnhub returns in millions
                'enterprise_value': self._usd_to_eur(metrics.get('enterpriseValueQuarterly')),
                
                # Valuation Ratios
                'pe_ratio': metrics.get('peExclExtraTTM'),
                'forward_pe': metrics.get('peBasicExclExtraTTM'),  # Using basic PE as proxy
                'peg_ratio': metrics.get('pegRatio'),
                'price_to_book': metrics.get('pbQuarterly'),
                'price_to_sales': metrics.get('psTTM'),
                'ev_to_ebitda': metrics.get('evToEbitdaTTM'),
                'ev_to_revenue': metrics.get('evToRevenueTTM'),
                
                # Financial Metrics (converted where applicable)
                'revenue': self._usd_to_eur(metrics.get('revenueTTM')),
                'revenue_growth': metrics.get('revenueGrowthTTMYoy'),
                'gross_profit': self._usd_to_eur(metrics.get('grossProfitTTM')),
                'ebitda': self._usd_to_eur(metrics.get('ebitdaTTM')),
                'net_income': self._usd_to_eur(metrics.get('netIncomeTTM')),
                'earnings_growth': metrics.get('epsGrowthTTMYoy'),
                
                # Per Share Data (converted to EUR)
                'eps': self._usd_to_eur(metrics.get('epsExclExtraItemsTTM')),
                'book_value_per_share': self._usd_to_eur(metrics.get('bookValuePerShareQuarterly')),
                'revenue_per_share': self._usd_to_eur(metrics.get('revenuePerShareTTM')),
                
                # Profitability Ratios (percentages, no conversion needed)
                'gross_margin': metrics.get('grossMarginTTM'),
                'operating_margin': metrics.get('operatingMarginTTM'),
                'profit_margin': metrics.get('netProfitMarginTTM'),
                'roe': metrics.get('roeTTM'),
                'roa': metrics.get('roaTTM'),
                
                # Financial Health
                'current_ratio': metrics.get('currentRatioQuarterly'),
                'quick_ratio': metrics.get('quickRatioQuarterly'),
                'debt_to_equity': metrics.get('totalDebt/totalEquityQuarterly'),
                
                # Dividend Data
                'dividend_yield': metrics.get('dividendYieldIndicatedAnnual') / 100 if metrics.get('dividendYieldIndicatedAnnual') else None,  # Convert percentage
                'dividend_rate': self._usd_to_eur(metrics.get('dividendsPerShareTTM')),
                'payout_ratio': metrics.get('payoutRatioTTM'),
                'ex_dividend_date': None,  # Not available in basic metrics
                
                # Other
                'beta': metrics.get('beta'),
                'fifty_day_ma': self._usd_to_eur(metrics.get('50DayMA')),
                'two_hundred_day_ma': self._usd_to_eur(metrics.get('200DayMA')),
                'target_price': None,  # Would need separate analyst endpoint
                'recommendation': None,  # Would need separate recommendation endpoint
                'number_of_analysts': metrics.get('numberOfAnalystEstimates'),
                
                # Status
                'last_updated': datetime.now(),
                'update_status': 'success',
                'error_message': None
            }
            
            logger.info(f"Successfully fetched Finnhub data for {ticker}")
            return stock_data
            
        except Exception as e:
            logger.error(f"Error fetching Finnhub data for {ticker}: {str(e)}")
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
            
            # Rate limiting (60 calls per minute)
            if i < total - 1:  # Don't delay after last ticker
                time.sleep(self.rate_limit_delay)
            
        return results