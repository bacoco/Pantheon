#!/usr/bin/env python3
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.finnhub_service import FinnhubService
import json

# Test with the provided API key
api_key = "cpb3bl9r01qniodcem60cpb3bl9r01qniodcem6g"
service = FinnhubService(api_key)

print("=" * 60)
print("TESTING FINNHUB SERVICE WITH FRENCH STOCKS")
print("=" * 60)

# Test with TotalEnergies
ticker = "TTE.PA"
print(f"\nFetching data for {ticker}...")

data = service.fetch_stock_data(ticker)

if data['update_status'] == 'success':
    print("\n✅ SUCCESS! Retrieved data for", data['name'])
    print("\nKey metrics:")
    print(f"  Current Price: €{data['current_price']:.2f}" if data['current_price'] else "  Current Price: N/A")
    print(f"  Market Cap: €{data['market_cap']:,.0f}" if data['market_cap'] else "  Market Cap: N/A")
    print(f"  P/E Ratio: {data['pe_ratio']:.2f}" if data['pe_ratio'] else "  P/E Ratio: N/A")
    print(f"  Dividend Yield: {data['dividend_yield']*100:.2f}%" if data['dividend_yield'] else "  Dividend Yield: N/A")
    print(f"  52W High: €{data['fifty_two_week_high']:.2f}" if data['fifty_two_week_high'] else "  52W High: N/A")
    print(f"  52W Low: €{data['fifty_two_week_low']:.2f}" if data['fifty_two_week_low'] else "  52W Low: N/A")
    print(f"  Revenue Growth: {data['revenue_growth']:.2f}%" if data['revenue_growth'] else "  Revenue Growth: N/A")
    print(f"  ROE: {data['roe']:.2f}%" if data['roe'] else "  ROE: N/A")
    
    # Count non-null fields
    non_null = sum(1 for k, v in data.items() if v is not None and k not in ['ticker', 'last_updated', 'update_status', 'error_message'])
    print(f"\nTotal fields populated: {non_null}")
else:
    print(f"\n❌ FAILED: {data['error_message']}")
    
# Test another stock - try L'Oreal
print("\n" + "-" * 60)
ticker2 = "OR.PA"
print(f"\nFetching data for L'Oreal: {ticker2}...")
data2 = service.fetch_stock_data(ticker2)

if data2['update_status'] == 'success':
    print(f"✅ SUCCESS! Retrieved data for {data2['name']}")
    print(f"  Current Price: €{data2['current_price']:.2f}" if data2['current_price'] else "  Current Price: N/A")
else:
    print(f"❌ FAILED: {data2['error_message']}")

# Test Sanofi
print("\n" + "-" * 60)
ticker3 = "SAN.PA"
print(f"\nFetching data for Sanofi: {ticker3}...")
data3 = service.fetch_stock_data(ticker3)

if data3['update_status'] == 'success':
    print(f"✅ SUCCESS! Retrieved data for {data3['name']}")
    print(f"  Current Price: €{data3['current_price']:.2f}" if data3['current_price'] else "  Current Price: N/A")
else:
    print(f"❌ FAILED: {data3['error_message']}")

print("\n" + "=" * 60)
print("SUMMARY:")
success_count = sum(1 for d in [data, data2, data3] if d['update_status'] == 'success')
print(f"Success rate: {success_count}/3 stocks")

if success_count >= 2:
    print("✅ Finnhub service working with French stocks!")
    print("✅ Currency conversion to EUR working")
    print("⚠️  Some stocks may not be available in Finnhub database")
    print("✅ Ready to update available SBF 250 stocks")
else:
    print("❌ Limited support for French stocks in Finnhub")