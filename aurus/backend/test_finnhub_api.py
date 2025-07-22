#!/usr/bin/env python3
import requests
import json

print("=" * 60)
print("TESTING FINNHUB API FOR FRENCH STOCKS")
print("=" * 60)

# Finnhub demo API key for testing
api_key = "sandbox_demo"  # Start with sandbox key

# Test stocks
test_tickers = ["TTE.PA", "TTE", "PA:TTE", "TTE:PA", "XPAR:TTE"]  # Try different formats

print("\nTesting different ticker formats for TotalEnergies...")
print("-" * 40)

for ticker in test_tickers:
    # 1. Test Company Profile
    profile_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker}&token={api_key}"
    print(f"\nTesting ticker format: {ticker}")
    
    try:
        response = requests.get(profile_url, timeout=10)
        print(f"Profile Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                print("✅ SUCCESS! Found company data")
                print(f"   Name: {data.get('name', 'N/A')}")
                print(f"   Country: {data.get('country', 'N/A')}")
                print(f"   Currency: {data.get('currency', 'N/A')}")
                print(f"   Exchange: {data.get('exchange', 'N/A')}")
                print(f"   Market Cap: {data.get('marketCapitalization', 'N/A')}")
                
                # If profile works, test quote
                quote_url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={api_key}"
                quote_resp = requests.get(quote_url, timeout=10)
                if quote_resp.status_code == 200:
                    quote = quote_resp.json()
                    print(f"   Current Price: {quote.get('c', 'N/A')}")
                    print(f"   High: {quote.get('h', 'N/A')}")
                    print(f"   Low: {quote.get('l', 'N/A')}")
                
                # Test metrics
                metrics_url = f"https://finnhub.io/api/v1/stock/metric?symbol={ticker}&metric=all&token={api_key}"
                metrics_resp = requests.get(metrics_url, timeout=10)
                if metrics_resp.status_code == 200:
                    metrics = metrics_resp.json()
                    if 'metric' in metrics:
                        m = metrics['metric']
                        print(f"   P/E Ratio: {m.get('peExclExtraTTM', 'N/A')}")
                        print(f"   Dividend Yield: {m.get('dividendYieldIndicatedAnnual', 'N/A')}")
                        print(f"   ROE: {m.get('roeTTM', 'N/A')}")
                
                break  # Found working format
            else:
                print("❌ No data returned")
        else:
            print(f"❌ Failed: {response.text[:100]}")
    except Exception as e:
        print(f"❌ Error: {e}")

# Test with free API key registration info
print("\n" + "=" * 60)
print("Finnhub API Info:")
print("- Register at: https://finnhub.io/register")
print("- Free tier: 60 API calls/minute")
print("- 30 API calls/second")
print("- Supports 60+ global exchanges")
print("- Real-time & historical data")
print("- Company fundamentals included")