@echo off
echo === Ask Your Data — Backend Setup ===

cd %~dp0

echo Creating virtual environment...
python -m venv .venv

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo === Setup complete! ===
echo Run: .venv\Scripts\activate.bat ^&^& uvicorn app.main:app --reload --port 8000
echo.
