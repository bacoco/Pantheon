from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Stock
from app.schemas import StockResponse, ScreeningRequest
from app.services.screening_service import ScreeningService
from app.sbf250_tickers import SBF250_TICKERS

router = APIRouter(
    prefix="/api/stocks",
    tags=["stocks"]
)

# Global state for update progress (shared with main.py)
update_progress = {"current": 0, "total": 0, "status": "idle", "current_ticker": ""}

@router.get("/", response_model=List[StockResponse])
def get_all_stocks(db: Session = Depends(get_db)):
    """Get all stocks from database"""
    stocks = db.query(Stock).all()
    return stocks

@router.get("/{ticker}", response_model=StockResponse)
def get_stock(ticker: str, db: Session = Depends(get_db)):
    """Get a specific stock by ticker"""
    stock = db.query(Stock).filter(Stock.ticker == ticker).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock

@router.post("/screen", response_model=List[StockResponse])
def screen_stocks(request: ScreeningRequest, db: Session = Depends(get_db)):
    """Apply screening criteria to stocks"""
    screening_service = ScreeningService(db)
    filtered_stocks = screening_service.apply_filters(request.criteria)
    return filtered_stocks

@router.get("/metrics/available")
def get_available_metrics(db: Session = Depends(get_db)):
    """Get list of available metrics for filtering"""
    screening_service = ScreeningService(db)
    return {"metrics": screening_service.get_available_metrics()}

@router.post("/update/failed")
def retry_failed_stocks(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Retry updating only stocks that failed in previous attempts"""
    # Get all stocks with failed status
    failed_stocks = db.query(Stock).filter(Stock.update_status == 'failed').all()
    failed_tickers = [stock.ticker for stock in failed_stocks]
    
    if not failed_tickers:
        return {"message": "No failed stocks to retry", "count": 0}
    
    # Reset progress
    update_progress["current"] = 0
    update_progress["total"] = len(failed_tickers)
    update_progress["status"] = "in_progress"
    update_progress["current_ticker"] = ""
    
    # Import update_stocks_task from main
    from app.main import update_stocks_task
    
    # Schedule background update for failed stocks only
    background_tasks.add_task(update_stocks_task, db, failed_tickers)
    
    return {
        "message": f"Retrying {len(failed_tickers)} failed stocks",
        "count": len(failed_tickers),
        "tickers": failed_tickers
    }