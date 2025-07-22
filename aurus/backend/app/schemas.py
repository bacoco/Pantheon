from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class StockResponse(BaseModel):
    ticker: str
    name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    
    # Price Data
    current_price: Optional[float] = None
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None
    volume: Optional[int] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    
    # Valuation Metrics
    market_cap: Optional[float] = None
    enterprise_value: Optional[float] = None
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_book: Optional[float] = None
    price_to_sales: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    ev_to_revenue: Optional[float] = None
    
    # Financial Metrics
    revenue: Optional[float] = None
    revenue_growth: Optional[float] = None
    gross_profit: Optional[float] = None
    ebitda: Optional[float] = None
    net_income: Optional[float] = None
    earnings_growth: Optional[float] = None
    
    # Per Share Data
    eps: Optional[float] = None
    book_value_per_share: Optional[float] = None
    revenue_per_share: Optional[float] = None
    
    # Profitability Ratios
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    profit_margin: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    
    # Financial Health
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    
    # Dividends
    dividend_yield: Optional[float] = None
    dividend_rate: Optional[float] = None
    payout_ratio: Optional[float] = None
    ex_dividend_date: Optional[datetime] = None
    
    # Technical Indicators
    beta: Optional[float] = None
    fifty_day_ma: Optional[float] = None
    two_hundred_day_ma: Optional[float] = None
    
    # Analyst Data
    target_price: Optional[float] = None
    recommendation: Optional[str] = None
    number_of_analysts: Optional[int] = None
    
    # Metadata
    last_updated: Optional[datetime] = None
    update_status: Optional[str] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True

class ScreeningRequest(BaseModel):
    criteria: Dict[str, Any]

class UpdateProgress(BaseModel):
    current: int
    total: int
    status: str
    current_ticker: str