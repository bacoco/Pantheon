import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import Stock

class ScreeningService:
    def __init__(self, db: Session):
        self.db = db
        
    def apply_filters(self, criteria: Dict[str, Any]) -> List[Stock]:
        """Apply screening criteria to stocks"""
        query = self.db.query(Stock)
        
        # Handle AND/OR logic
        logic = criteria.get('logic', 'AND')
        conditions = []
        
        for field, condition in criteria.items():
            if field in ['logic']:
                continue
                
            operator = condition.get('operator')
            value = condition.get('value')
            
            # Build SQLAlchemy condition
            column = getattr(Stock, field)
            
            if operator == '>':
                conditions.append(column > value)
            elif operator == '<':
                conditions.append(column < value)
            elif operator == '>=':
                conditions.append(column >= value)
            elif operator == '<=':
                conditions.append(column <= value)
            elif operator == '=':
                conditions.append(column == value)
            elif operator == 'between':
                min_val = value.get('min')
                max_val = value.get('max')
                conditions.append(and_(column >= min_val, column <= max_val))
        
        # Apply logic
        if logic == 'AND':
            query = query.filter(and_(*conditions))
        else:
            query = query.filter(or_(*conditions))
            
        return query.all()
    
    def get_available_metrics(self) -> List[str]:
        """Return list of filterable metrics"""
        # Get column names excluding metadata
        exclude = ['ticker', 'name', 'sector', 'industry', 'last_updated', 
                  'update_status', 'error_message', 'ex_dividend_date', 'recommendation']
        
        columns = [col.name for col in Stock.__table__.columns 
                  if col.name not in exclude]
        
        return sorted(columns)