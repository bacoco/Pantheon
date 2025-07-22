from sqlalchemy import Column, String, Float, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"
    
    # Identifiers
    ticker = Column(String, primary_key=True)
    name = Column(String)
    sector = Column(String)
    industry = Column(String)
    
    # Price Data
    current_price = Column(Float)
    open_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    close_price = Column(Float)
    volume = Column(Integer)
    fifty_two_week_high = Column(Float)
    fifty_two_week_low = Column(Float)
    
    # Valuation Metrics
    market_cap = Column(Float)
    enterprise_value = Column(Float)
    pe_ratio = Column(Float)
    forward_pe = Column(Float)
    peg_ratio = Column(Float)
    price_to_book = Column(Float)
    price_to_sales = Column(Float)
    ev_to_ebitda = Column(Float)
    ev_to_revenue = Column(Float)
    
    # Financial Metrics
    revenue = Column(Float)
    revenue_growth = Column(Float)
    gross_profit = Column(Float)
    ebitda = Column(Float)
    net_income = Column(Float)
    earnings_growth = Column(Float)
    
    # Per Share Data
    eps = Column(Float)
    book_value_per_share = Column(Float)
    revenue_per_share = Column(Float)
    
    # Profitability Ratios
    gross_margin = Column(Float)
    operating_margin = Column(Float)
    profit_margin = Column(Float)
    roe = Column(Float)
    roa = Column(Float)
    
    # Financial Health
    current_ratio = Column(Float)
    quick_ratio = Column(Float)
    debt_to_equity = Column(Float)
    
    # Dividends
    dividend_yield = Column(Float)
    dividend_rate = Column(Float)
    payout_ratio = Column(Float)
    ex_dividend_date = Column(DateTime)
    
    # Technical Indicators
    beta = Column(Float)
    fifty_day_ma = Column(Float)
    two_hundred_day_ma = Column(Float)
    
    # Analyst Data
    target_price = Column(Float)
    recommendation = Column(String)
    number_of_analysts = Column(Integer)
    
    # Metadata
    last_updated = Column(DateTime)
    update_status = Column(String)  # 'success', 'failed', 'pending'
    error_message = Column(Text)

class ScreeningCriteria(Base):
    __tablename__ = "screening_criteria"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(Text)
    criteria_json = Column(Text)  # Store filter criteria as JSON
    created_at = Column(DateTime)
    is_preset = Column(Integer)  # Boolean for built-in presets