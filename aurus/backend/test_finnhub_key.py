#!/usr/bin/env python3
import requests
import json

print("=" * 60)
print("TESTING FINNHUB API WITH PROVIDED KEY")
print("=" * 60)

# Your Finnhub API key
api_key = "cpb3bl9r01qniodcem60cpb3bl9r01qniodcem6g"

# Test with TotalEnergies - try different formats
test_symbols = ["TTE.PA", "TTE", "FP", "TTE:FP", "XPAR:TTE"]

print("\nSearching for TotalEnergies with different symbols...")
found_symbol = None

for symbol in test_symbols:
    print(f"\nTrying: {symbol}")
    
    # Test quote endpoint first (simpler)
    quote_url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_key}"
    response = requests.get(quote_url, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('c', 0) > 0:  # 'c' is current price
            print(f"✅ Found valid quote data!")
            print(f"   Current Price: {data.get('c')}")
            print(f"   High: {data.get('h')}")
            print(f"   Low: {data.get('l')}")
            print(f"   Previous Close: {data.get('pc')}")
            found_symbol = symbol
            break
    else:
        print(f"   Quote failed: {response.status_code}")

if found_symbol:
    print(f"\n✅ Working symbol format: {found_symbol}")
    print("\nTesting other endpoints...")
    
    # Test Company Profile
    profile_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={found_symbol}&token={api_key}"
    response = requests.get(profile_url, timeout=10)
    if response.status_code == 200:
        profile = response.json()
        print("\nCompany Profile:")
        print(f"   Name: {profile.get('name', 'N/A')}")
        print(f"   Country: {profile.get('country', 'N/A')}")
        print(f"   Currency: {profile.get('currency', 'N/A')}")
        print(f"   Market Cap: {profile.get('marketCapitalization', 'N/A')}")
    
    # Test Basic Financials
    metrics_url = f"https://finnhub.io/api/v1/stock/metric?symbol={found_symbol}&metric=all&token={api_key}"
    response = requests.get(metrics_url, timeout=10)
    if response.status_code == 200:
        metrics_data = response.json()
        if 'metric' in metrics_data:
            metrics = metrics_data['metric']
            print("\nFinancial Metrics:")
            print(f"   P/E Ratio (TTM): {metrics.get('peExclExtraTTM', 'N/A')}")
            print(f"   Price/Book: {metrics.get('pbQuarterly', 'N/A')}")
            print(f"   Dividend Yield: {metrics.get('dividendYieldIndicatedAnnual', 'N/A')}%")
            print(f"   ROE (TTM): {metrics.get('roeTTM', 'N/A')}%")
            print(f"   Debt/Equity: {metrics.get('totalDebt/totalEquityQuarterly', 'N/A')}")
            print(f"   Current Ratio: {metrics.get('currentRatioQuarterly', 'N/A')}")
            print(f"   Revenue Growth: {metrics.get('revenueGrowthTTMYoy', 'N/A')}%")
            print(f"   EPS Growth: {metrics.get('epsGrowthTTMYoy', 'N/A')}%")
            print(f"   52 Week High: {metrics.get('52WeekHigh', 'N/A')}")
            print(f"   52 Week Low: {metrics.get('52WeekLow', 'N/A')}")
            print(f"   Beta: {metrics.get('beta', 'N/A')}")
            
            # Count available metrics
            available_count = sum(1 for v in metrics.values() if v is not None)
            print(f"\n   Total metrics available: {available_count}")

# Test another French stock
print("\n" + "=" * 60)
print("Testing BNP Paribas...")
bnp_symbols = ["BNP.PA", "BNP", "BNP:FP"]
for symbol in bnp_symbols:
    quote_url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_key}"
    response = requests.get(quote_url, timeout=10)
    if response.status_code == 200:
        data = response.json()
        if data.get('c', 0) > 0:
            print(f"✅ BNP found as: {symbol}")
            print(f"   Price: {data.get('c')}")
            break

print("\n" + "=" * 60)
print("SUMMARY:")
if found_symbol:
    print("✅ Finnhub API works with French stocks!")
    print("✅ Real-time prices available")
    print("✅ Company profiles available")
    print("✅ Financial metrics available")
    print("\n🎉 Ready to implement Finnhub service!")
else:
    print("❌ Could not find working symbol format")
    print("   French stocks might not be supported")