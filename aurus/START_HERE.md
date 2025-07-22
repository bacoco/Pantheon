# 🚀 Quick Start Instructions

## Option 1: Run Both Services Together (Recommended)
```bash
cd /Users/loic/develop/BACO/aurus
./start.sh
```

## Option 2: Run Services Separately

### Terminal 1 - Backend:
```bash
cd /Users/loic/develop/BACO/aurus/backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend:
```bash
cd /Users/loic/develop/BACO/aurus/frontend
npm start
```

## 📱 Access the Application

1. Wait for both services to start
2. Open http://localhost:3000 in your browser
3. Click "Update All Data" to fetch SBF 250 stocks (takes ~3 minutes)

## 🛑 To Stop

- Press `Ctrl+C` in each terminal
- Or if using start.sh, press `Ctrl+C` once

## 📚 Documentation

- API docs: http://localhost:8000/docs
- Test plan: see TEST_PLAN.md
- Troubleshooting: see TROUBLESHOOTING.md
- Quick reference: see QUICK_REFERENCE.md

---
✅ Dependencies are already installed and ready to go!