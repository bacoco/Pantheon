from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

from app.database import get_db
from app.models import Stock
from app.services.screening_service import ScreeningService
from app.services.export_service import ExportService

router = APIRouter(
    prefix="/api/export",
    tags=["export"]
)

@router.post("/csv")
def export_to_csv(
    columns: Optional[List[str]] = None,
    filters: Optional[Dict] = None,
    db: Session = Depends(get_db)
):
    """Export stocks to CSV with European formatting"""
    # Get stocks (filtered or all)
    if filters:
        screening_service = ScreeningService(db)
        stocks = screening_service.apply_filters(filters)
    else:
        stocks = db.query(Stock).all()
    
    # Generate CSV
    csv_content = ExportService.export_to_csv(stocks, columns, filters)
    filename = ExportService.generate_filename(filtered=bool(filters))
    
    # Return as file download
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8"
        }
    )

@router.post("/excel")
def export_to_excel(
    columns: Optional[List[str]] = None,
    filters: Optional[Dict] = None,
    db: Session = Depends(get_db)
):
    """Export stocks to Excel format (future enhancement)"""
    return {"message": "Excel export not yet implemented", "status": "coming_soon"}