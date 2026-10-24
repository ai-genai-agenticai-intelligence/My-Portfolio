# Abhishek Sahoo – AI Engineer Portfolio

Live: https://my-portfolio-fwt5.onrender.com

FastAPI backend (contact form, 1:1 booking, AI chat agent) serving a static frontend.

## Run locally
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # add your own API keys
uvicorn app:app --reload
```
Open http://localhost:8000

## Config (`.env`)
`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY` – chat agent providers  
`ALLOWED_ORIGINS` – comma-separated CORS origins (defaults to localhost + Render URL)

## Security notes
Only whitelisted files (`PUBLIC_FILES` in `app.py`) and `/images` are served. Never mount the project root as static files.
