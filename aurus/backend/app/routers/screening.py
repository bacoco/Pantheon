from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime

from app.database import get_db
from app.models import ScreeningCriteria
from app.sbf250_tickers import SCREENING_PRESETS

router = APIRouter(
    prefix="/api/screening",
    tags=["screening"]
)

@router.get("/presets")
def get_screening_presets():
    """Get all available screening presets"""
    return {"presets": SCREENING_PRESETS}

@router.get("/presets/{preset_id}")
def get_screening_preset(preset_id: str):
    """Get a specific screening preset"""
    if preset_id not in SCREENING_PRESETS:
        raise HTTPException(status_code=404, detail="Preset not found")
    return SCREENING_PRESETS[preset_id]

@router.post("/save")
def save_screening_criteria(
    name: str,
    criteria: dict,
    description: str = "",
    db: Session = Depends(get_db)
):
    """Save custom screening criteria"""
    # Check if name already exists
    existing = db.query(ScreeningCriteria).filter(
        ScreeningCriteria.name == name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Criteria name already exists")
    
    # Create new criteria
    new_criteria = ScreeningCriteria(
        name=name,
        description=description,
        criteria_json=json.dumps(criteria),
        created_at=datetime.now(),
        is_preset=0
    )
    
    db.add(new_criteria)
    db.commit()
    db.refresh(new_criteria)
    
    return {"message": "Criteria saved successfully", "id": new_criteria.id}

@router.get("/saved")
def get_saved_criteria(db: Session = Depends(get_db)):
    """Get all saved screening criteria"""
    criteria = db.query(ScreeningCriteria).all()
    return {
        "criteria": [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "criteria": json.loads(c.criteria_json),
                "created_at": c.created_at,
                "is_preset": bool(c.is_preset)
            }
            for c in criteria
        ]
    }

@router.delete("/saved/{criteria_id}")
def delete_saved_criteria(criteria_id: int, db: Session = Depends(get_db)):
    """Delete saved screening criteria"""
    criteria = db.query(ScreeningCriteria).filter(
        ScreeningCriteria.id == criteria_id
    ).first()
    
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    if criteria.is_preset:
        raise HTTPException(status_code=400, detail="Cannot delete preset criteria")
    
    db.delete(criteria)
    db.commit()
    
    return {"message": "Criteria deleted successfully"}