SBF250_TICKERS = [
    "AC.PA",      # Accor
    "ACA.PA",     # Credit Agricole
    "AI.PA",      # Air Liquide
    "AIR.PA",     # Airbus
    "ALO.PA",     # Alstom
    "ATO.PA",     # Atos
    "BN.PA",      # Danone
    "BNP.PA",     # BNP Paribas
    "CA.PA",      # Carrefour
    "CAP.PA",     # Capgemini
    "CS.PA",      # AXA
    "DG.PA",      # Vinci
    "EL.PA",      # EssilorLuxottica
    "EN.PA",      # Bouygues
    "ENGI.PA",    # Engie
    "FP.PA",      # Total
    "GLE.PA",     # Societe Generale
    "HO.PA",      # Thales
    "KER.PA",     # Kering
    "LR.PA",      # Legrand
    "MC.PA",      # LVMH
    "ML.PA",      # Michelin
    "OR.PA",      # L'Oreal
    "ORA.PA",     # Orange
    "PUB.PA",     # Publicis
    "RNO.PA",     # Renault
    "SAF.PA",     # Safran
    "SAN.PA",     # Sanofi
    "SGO.PA",     # Saint-Gobain
    "SU.PA",      # Schneider Electric
    "TTE.PA",     # TotalEnergies
    "VIE.PA",     # Veolia
    "VIV.PA",     # Vivendi
    # ... add all 250 tickers with .PA suffix
    # This is a subset - complete list needed for production
]

# Pre-built screening templates
SCREENING_PRESETS = {
    "value_stocks": {
        "name": "Value Stocks",
        "description": "Low P/E, High Dividend Yield",
        "criteria": {
            "pe_ratio": {"operator": "<", "value": 15},
            "dividend_yield": {"operator": ">", "value": 3},
            "logic": "AND"
        }
    },
    "growth_stocks": {
        "name": "Growth Stocks", 
        "description": "High Revenue & Earnings Growth",
        "criteria": {
            "revenue_growth": {"operator": ">", "value": 15},
            "earnings_growth": {"operator": ">", "value": 15},
            "logic": "AND"
        }
    },
    "quality_dividend": {
        "name": "Dividend Champions",
        "description": "Stable dividends with low payout ratio",
        "criteria": {
            "dividend_yield": {"operator": ">", "value": 2},
            "payout_ratio": {"operator": "<", "value": 60},
            "roe": {"operator": ">", "value": 15},
            "logic": "AND"
        }
    },
    "financially_healthy": {
        "name": "Financial Health",
        "description": "Strong balance sheet companies",
        "criteria": {
            "current_ratio": {"operator": ">", "value": 1.5},
            "debt_to_equity": {"operator": "<", "value": 0.5},
            "roe": {"operator": ">", "value": 10},
            "logic": "AND"
        }
    }
}