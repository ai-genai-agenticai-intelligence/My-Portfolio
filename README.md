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

## Finale animation (v6.0)
The "Ready To Collaborate" finale features a responsive 3D quantum crystal core with continuous ambient levitation,
orbiting agent photons, and an interactive mouse-tilt parallax gyroscope (styled in `style.css` and powered by
`initCinemaFinale` in `script.js`). The section reveals instantly upon entering the viewport with an ultra-smooth
staggered sequence, eliminating sluggish pinned scroll traps while keeping action buttons immediately accessible.


## Design system ("Ember Grid")
All of the look-and-feel lives in `ember.css`, loaded after `style.css`. Delete the `<link>` to it in
`index.html` to return to the previous design. Key ideas: fine grid + rising ember glow canvas, condensed
uppercase display headlines (Anton, self-hosted in `fonts/`, SIL OFL licence included), dark "slide" cards
and solid orange cards, chat-bubble panels, and "»" pill buttons. Tokens (`--cream`, `--ember-grad`,
`--slide-bg`, `--font-display`) are at the top of the file. Text colours are checked against WCAG AA in
both themes; solid orange surfaces use `--ember-grad` (deeper orange) so white text stays readable.

