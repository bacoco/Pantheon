import csv
import io
import json
from datetime import datetime
from typing import List, Dict, Optional
import pandas as pd
from app.models import Stock

class ExportService:
    @staticmethod
    def export_to_csv(stocks: List[Stock], 
                     columns: Optional[List[str]] = None,
                     filters_applied: Optional[Dict] = None) -> str:
        """Export stocks to CSV with European formatting"""
        
        # Convert to pandas DataFrame
        data = []
        for stock in stocks:
            row = {col.name: getattr(stock, col.name) 
                  for col in stock.__table__.columns}
            data.append(row)
        
        df = pd.DataFrame(data)
        
        # Select columns if specified
        if columns:
            df = df[columns]
        
        # Format numbers for European Excel
        # Use semicolon as delimiter, comma as decimal separator
        for col in df.select_dtypes(include=['float']).columns:
            df[col] = df[col].apply(lambda x: f"{x:,.2f}".replace(',', 'X')
                                              .replace('.', ',')
                                              .replace('X', '.') 
                                   if pd.notna(x) else '')
        
        # Create CSV with metadata
        output = io.StringIO()
        
        # Write metadata
        output.write(f"# Aurus SBF 250 Export\n")
        output.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        output.write(f"# Total Stocks: {len(stocks)}\n")
        
        if filters_applied:
            output.write(f"# Filters Applied: {json.dumps(filters_applied)}\n")
        
        output.write("#\n")
        
        # Write data
        df.to_csv(output, sep=';', index=False)
        
        return output.getvalue()
    
    @staticmethod
    def generate_filename(filtered: bool = False) -> str:
        """Generate filename following convention"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        prefix = "aurus_sbf250_filtered" if filtered else "aurus_sbf250_export"
        return f"{prefix}_{timestamp}.csv"