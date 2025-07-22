# Troubleshooting Guide

## Quick Fixes

### 🔧 Backend Issues

**Error: `ModuleNotFoundError: No module named 'yfinance'`**
```bash
cd backend
pip install yfinance
```

**Error: `uvicorn: command not found`**
```bash
cd backend
pip install uvicorn
```

**Error: Database locked**
```bash
cd backend
rm aurus.db  # Warning: This deletes all cached data
```

### 🎨 Frontend Issues

**Error: `ag-grid-react` not found**
```bash
cd frontend
npm install ag-grid-react ag-grid-community
```

**Error: Port 3000 already in use**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or change port in package.json
```

**Blank screen / Components not loading**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### 🌐 API Issues

**CORS errors in browser console**
- Ensure backend is running on http://localhost:8000
- Check `app/main.py` has CORS middleware configured
- Try incognito/private browser window

**429 Too Many Requests from yfinance**
- Rate limiting is already implemented (500ms delay)
- If still occurring, increase delay in `yfinance_service.py`
- Consider using VPN if your IP is blocked

### 📊 Data Issues

**No stocks showing after update**
- Check backend console for errors
- Verify internet connection
- Try updating a single stock first:
  ```bash
  curl -X POST http://localhost:8000/api/stocks/update
  ```

**Missing financial metrics**
- Some stocks may not have all metrics
- This is normal - yfinance data availability varies
- Check `backend/logs` for specific ticker errors

**European formatting not working**
- Ensure your system locale supports European formats
- CSV should use semicolon (;) as delimiter
- Numbers should use comma (,) as decimal separator

## Manual Testing

### Test Backend Separately
```bash
cd backend
uvicorn app.main:app --reload

# In another terminal:
curl http://localhost:8000/api/stocks
curl http://localhost:8000/api/health
```

### Test Frontend Separately
```bash
cd frontend
npm start

# Check browser console for errors
# Should connect to backend at localhost:8000
```

### Check Database
```bash
cd backend
sqlite3 aurus.db
.tables  # Should show: stocks, screening_criteria
SELECT COUNT(*) FROM stocks;  # Should show number of loaded stocks
.quit
```

## Clean Start

If nothing works, try a complete clean start:

```bash
# Stop all services (Ctrl+C)

# Clean backend
cd backend
rm -rf venv aurus.db __pycache__
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Clean frontend  
cd ../frontend
rm -rf node_modules package-lock.json
npm install

# Start fresh
cd ..
./start.sh
```

## Debug Mode

For detailed debugging, run services manually:

**Backend with debug logging:**
```bash
cd backend
PYTHONPATH=. python -m uvicorn app.main:app --reload --log-level debug
```

**Frontend with debug:**
```bash
cd frontend
REACT_APP_DEBUG=true npm start
```

## Getting Help

If issues persist:
1. Check the error messages carefully
2. Look for specific error codes
3. Search for the error message + "yfinance" or "FastAPI" or "React"
4. Consider the yfinance GitHub issues: https://github.com/ranaroussi/yfinance/issues