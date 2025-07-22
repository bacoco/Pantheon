import requests
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class YahooV8Service:
    def __init__(self):
        self.rate_limit_delay = 2.0  # 2 seconds between requests
        self.base_url = "https://query1.finance.yahoo.com/v8/finance/chart"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
    def fetch_stock_data(self, ticker: str) -> Optional[Dict]:
        """Fetch comprehensive data for a single stock using Yahoo v8 API"""
        try:
            # Prepare URL and parameters
            url = f"{self.base_url}/{ticker}"
            params = {
                'interval': '1d',
                'includePrePost': 'true',
                'indicators': 'quote',
                'includeTimestamps': 'true',
                'includeAdjustedClose': 'true',
                'period1': '0',  # From beginning
                'period2': str(int(datetime.now().timestamp()))  # To now
            }
            
            # Make request
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code != 200:
                logger.error(f"HTTP {response.status_code} for {ticker}")
                return {
                    'ticker': ticker,
                    'last_updated': datetime.now(),
                    'update_status': 'failed',
                    'error_message': f'HTTP {response.status_code}'
                }
            
            data = response.json()
            
            # Check if we got valid data
            if "chart" not in data or not data["chart"]["result"]:
                logger.error(f"No chart data for {ticker}")
                return {
                    'ticker': ticker,
                    'last_updated': datetime.now(),
                    'update_status': 'failed',
                    'error_message': 'No chart data returned'
                }
            
            result = data["chart"]["result"][0]
            meta = result.get("meta", {})
            
            # Extract available data
            stock_data = {
                'ticker': ticker,
                'name': meta.get('longName') or meta.get('shortName'),
                'sector': None,  # Not available in v8 API
                'industry': None,  # Not available in v8 API
                
                # Price data
                'current_price': meta.get('regularMarketPrice'),
                'open_price': meta.get('regularMarketOpen'),
                'high_price': meta.get('regularMarketDayHigh'),
                'low_price': meta.get('regularMarketDayLow'),
                'close_price': meta.get('previousClose'),
                'volume': meta.get('regularMarketVolume'),
                
                # 52-week data
                'fifty_two_week_high': meta.get('fiftyTwoWeekHigh'),
                'fifty_two_week_low': meta.get('fiftyTwoWeekLow'),
                
                # Not available in v8
                'market_cap': None,
                'enterprise_value': None,
                'pe_ratio': None,
                'forward_pe': None,
                'peg_ratio': None,
                'price_to_book': None,
                'price_to_sales': None,
                'ev_to_ebitda': None,
                'ev_to_revenue': None,
                'revenue': None,
                'revenue_growth': None,
                'gross_profit': None,
                'ebitda': None,
                'net_income': None,
                'earnings_growth': None,
                'eps': None,
                'book_value_per_share': None,
                'revenue_per_share': None,
                'gross_margin': None,
                'operating_margin': None,
                'profit_margin': None,
                'roe': None,
                'roa': None,
                'current_ratio': None,
                'quick_ratio': None,
                'debt_to_equity': None,
                'dividend_yield': None,
                'dividend_rate': None,
                'payout_ratio': None,
                'ex_dividend_date': None,
                'beta': None,
                'target_price': None,
                'recommendation': None,
                'number_of_analysts': None,
                
                # Status
                'last_updated': datetime.now(),
                'update_status': 'success',
                'error_message': None
            }
            
            # Calculate moving averages from historical data
            indicators = result.get("indicators", {})
            if indicators.get("quote"):
                quote = indicators["quote"][0]
                closes = quote.get("close", [])
                
                # Filter out None values
                valid_closes = [c for c in closes if c is not None]
                
                if len(valid_closes) >= 50:
                    stock_data['fifty_day_ma'] = sum(valid_closes[-50:]) / 50
                else:
                    stock_data['fifty_day_ma'] = None
                    
                if len(valid_closes) >= 200:
                    stock_data['two_hundred_day_ma'] = sum(valid_closes[-200:]) / 200
                else:
                    stock_data['two_hundred_day_ma'] = None
            else:
                stock_data['fifty_day_ma'] = None
                stock_data['two_hundred_day_ma'] = None
            
            logger.info(f"Successfully fetched data for {ticker}")
            return stock_data
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching {ticker}")
            return {
                'ticker': ticker,
                'last_updated': datetime.now(),
                'update_status': 'failed',
                'error_message': 'Request timeout'
            }
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
            if i < total - 1:  # Don't delay after last ticker
                time.sleep(self.rate_limit_delay)
            
        return results