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

## Scroll animation
The "Ready To Collaborate" finale is a pinned, scroll-scrubbed sequence (glass 3D emblem, dot-grid + glow,
word-by-word headline reveal). It is driven by a single CSS variable `--p` (0 to 1) set in `script.js`
(`initCinemaFinale`) and styled in `style.css` (search "v5.0"). Visitors who prefer reduced motion get the
finished layout with no animation. Tune the length with `.cinema-ready .cinema-track { height }` and the
timing by editing the `--p` thresholds in the same block.

