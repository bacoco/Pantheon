from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import asyncio
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

from app.database import get_db, engine
from app.models import Base, Stock
from app.services.finnhub_service import FinnhubService
from app.sbf250_tickers import SBF250_TICKERS
from app.routers import stocks, screening, export

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aurus SBF 250 Analyzer")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for update progress
update_progress = {"current": 0, "total": 0, "status": "idle", "current_ticker": ""}

# Include routers
app.include_router(stocks.router)
app.include_router(screening.router)
app.include_router(export.router)

@app.get("/")
def read_root():
    return {
        "message": "Aurus SBF 250 Analyzer API", 
        "version": "1.0.0",
        "endpoints": {
            "stocks": "/api/stocks",
            "screening": "/api/screening",
            "export": "/api/export",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Check database connection
        stock_count = db.query(Stock).count()
        return {
            "status": "healthy",
            "database": "connected",
            "stocks_loaded": stock_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/api/stocks/update")
async def update_all_stocks(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger update of all stock data"""
    background_tasks.add_task(update_stocks_task, db)
    return {"message": "Update started", "status": "processing"}

@app.get("/api/stocks/update/progress")
def get_update_progress():
    """Get current update progress"""
    return update_progress

def update_stocks_task(db: Session, tickers: List[str] = None):
    """Background task to update stocks"""
    global update_progress
    
    # Get API key from environment
    api_key = os.getenv('FINNHUB_API_KEY')
    if not api_key:
        update_progress["status"] = "error"
        update_progress["error"] = "FINNHUB_API_KEY not set in environment"
        logger.error("FINNHUB_API_KEY not found in environment variables")
        return
    
    finnhub_service = FinnhubService(api_key=api_key)
    
    # Use provided tickers or default to all SBF250
    tickers_to_update = tickers or SBF250_TICKERS
    
    update_progress["total"] = len(tickers_to_update)
    update_progress["status"] = "running"
    
    def progress_callback(current, total, ticker):
        update_progress["current"] = current
        update_progress["current_ticker"] = ticker
    
    # Fetch all data
    stock_data = finnhub_service.fetch_all_sbf250(
        tickers_to_update, 
        progress_callback
    )
    
    # Update database
    for data in stock_data:
        ticker = data['ticker']
        stock = db.query(Stock).filter(Stock.ticker == ticker).first()
        
        if stock:
            # Update existing
            for key, value in data.items():
                setattr(stock, key, value)
        else:
            # Create new
            stock = Stock(**data)
            db.add(stock)
    
    db.commit()
    
    update_progress["status"] = "completed"
    update_progress["current_ticker"] = ""