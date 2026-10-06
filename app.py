"""
Abhishek Sahoo - AI & Agentic Systems Engineer Portfolio
Production FastAPI Backend with Supabase/SQLite Database, Stripe Checkout & Appointment Booking
"""

import os
import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional, List
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, Response
from pydantic import BaseModel, EmailStr

# Load environment variables from .env if present
load_dotenv()

# Initialize FastAPI App
app = FastAPI(
    title="Abhishek Sahoo Portfolio & Booking API",
    description="Backend API for 1-on-1 AI Strategy Appointments, Stripe Payments, Contact Messaging & Supabase Integration",
    version="1.0.0"
)

# Enable CORS for cross-origin frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup (SQLite local default with automated table creation matching Supabase schema)
DB_PATH = "portfolio.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Appointments Table (Supabase Schema compatible)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        session_type TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER DEFAULT 45,
        message TEXT,
        payment_status TEXT DEFAULT 'confirmed',
        stripe_session_id TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # 2. Availability / Blocked Slots Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        is_blocked BOOLEAN DEFAULT 0,
        appointment_id TEXT,
        created_at TEXT NOT NULL
    )
    """)
    
    # 3. Contact Inquiries Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

init_db()

# ==============================================================================
# PYDANTIC DATA MODELS
# ==============================================================================
class ContactRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: Optional[str] = "General Project Inquiry"
    message: str

class BookingRequest(BaseModel):
    client_name: str
    client_email: str
    client_phone: Optional[str] = ""
    session_type: str
    date: str
    time: str
    duration: Optional[int] = 45
    message: Optional[str] = ""

class StripeCheckoutRequest(BaseModel):
    appointment_id: str
    session_type: str
    client_name: str
    client_email: str
    amount_cents: int
    currency: Optional[str] = "usd"

# ==============================================================================
# HELPER FUNCTIONS & ICS GENERATOR
# ==============================================================================
def create_ics_calendar_invite(appointment_id: str, title: str, client_name: str, date_str: str, time_str: str, session_type: str) -> str:
    """Generates standard RFC 5545 iCalendar (.ics) format string."""
    return f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Abhishek Sahoo//AI Engineer Consultation//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{appointment_id}@abhisheksahoo.ai
DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}
SUMMARY:{title}
DESCRIPTION:Session: {session_type}\\nClient: {client_name}\\nMeeting link will be shared via Google Meet.
LOCATION:Google Meet / Online
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "developer": "Abhishek Sahoo",
        "system": "Autonomous Multi-Agent AI Portfolio & Booking API"
    }

# --- 1. CONTACT MESSAGE ENDPOINT ---
@app.post("/api/contact")
def handle_contact(payload: ContactRequest, background_tasks: BackgroundTasks):
    msg_id = f"MSG-{uuid.uuid4().hex[:8].upper()}"
    created_at = datetime.utcnow().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO contact_messages (id, name, email, subject, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (msg_id, payload.name, payload.email, payload.subject, payload.message, created_at))
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "message_id": msg_id,
        "status": "Message received and dispatched to Abhishek Sahoo."
    }

# --- 2. APPOINTMENT BOOKING ENDPOINT ---
@app.post("/api/appointments")
def create_appointment(payload: BookingRequest):
    appointment_id = f"ABHI-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"
    created_at = datetime.utcnow().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if slot already booked to prevent double-booking
    cursor.execute("""
        SELECT id FROM appointments 
        WHERE date = ? AND time = ? AND payment_status != 'cancelled'
    """, (payload.date, payload.time))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        raise HTTPException(
            status_code=400, 
            detail=f"Time slot {payload.time} on {payload.date} is already reserved. Please select another slot."
        )
    
    cursor.execute("""
        INSERT INTO appointments (
            id, client_name, client_email, client_phone, session_type, 
            date, time, duration, message, payment_status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        appointment_id, payload.client_name, payload.client_email, payload.client_phone,
        payload.session_type, payload.date, payload.time, payload.duration,
        payload.message, "confirmed", created_at
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "appointment_id": appointment_id,
        "client_name": payload.client_name,
        "client_email": payload.client_email,
        "session_type": payload.session_type,
        "date": payload.date,
        "time": payload.time,
        "payment_status": "confirmed",
        "message": "Appointment locked and confirmed."
    }

# --- 3. CHECK AVAILABILITY ENDPOINT ---
@app.get("/api/availability")
def get_availability(date: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT time FROM appointments WHERE date = ? AND payment_status != 'cancelled'", (date,))
    booked_slots = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    all_slots = ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM", "08:00 PM"]
    available_slots = [s for s in all_slots if s not in booked_slots]
    
    return {
        "date": date,
        "available_slots": available_slots,
        "booked_slots": booked_slots
    }

# --- 4. DOWNLOAD ICS CALENDAR INVITE ---
@app.get("/api/appointments/{appointment_id}/ics")
def download_ics(appointment_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT client_name, session_type, date, time FROM appointments WHERE id = ?", (appointment_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    client_name, session_type, date_str, time_str = row
    ics_content = create_ics_calendar_invite(
        appointment_id=appointment_id,
        title=f"AI Strategy Session: Abhishek Sahoo & {client_name}",
        client_name=client_name,
        date_str=date_str,
        time_str=time_str,
        session_type=session_type
    )
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=meeting-{appointment_id}.ics"}
    )

# --- 5. STRIPE CHECKOUT SIMULATION / SESSION CREATION ---
@app.post("/api/create-checkout-session")
def create_stripe_checkout(payload: StripeCheckoutRequest):
    stripe_session_id = f"cs_test_{uuid.uuid4().hex}"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE appointments SET stripe_session_id = ? WHERE id = ?
    """, (stripe_session_id, payload.appointment_id))
    conn.commit()
    conn.close()
    
    return {
        "stripe_session_id": stripe_session_id,
        "checkout_url": f"https://checkout.stripe.com/pay/{stripe_session_id}",
        "appointment_id": payload.appointment_id,
        "amount": payload.amount_cents / 100,
        "currency": payload.currency
    }

# --- 6. STRIPE WEBHOOK HANDLER ---
@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    data = await request.json()
    event_type = data.get("type", "checkout.session.completed")
    
    if event_type == "checkout.session.completed":
        session_obj = data.get("data", {}).get("object", {})
        appointment_id = session_obj.get("metadata", {}).get("appointment_id")
        
        if appointment_id:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("UPDATE appointments SET payment_status = 'paid' WHERE id = ?", (appointment_id,))
            conn.commit()
            conn.close()
            
    return {"status": "success", "event_received": event_type}

class AgentChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    client_name: Optional[str] = "Anonymous Visitor"

# --- SYSTEM PERSONA KNOWLEDGE BASE ---
SYSTEM_PERSONA = """You are AbhiBot, the autonomous AI Concierge for Abhishek Sahoo's official portfolio.
Your role is to represent Abhishek Sahoo warmly, professionally, and accurately to clients, recruiters, and collaborators.

Abhishek Sahoo Profile:
- Title: AI & Agentic Systems Engineer
- Education: B.E. Computer Science & Engineering (2022 - 2026) at Sikkim Manipal Institute of Technology (SMIT)
- Specializations: Autonomous Multi-Agent Workflows, LangGraph, Model Context Protocol (MCP), Responsible AI Guardrails, FastAPI, PyTorch, Computer Vision.
- Contact: Phone / WhatsApp: +91 8984065377, Email: abhisheksahoo08583@gmail.com
- Key Live Deployments:
  1. ResearchMind: Autonomous Deep Research Multi-Agent system.
  2. Multi-Node LangGraph Architecture: Stateful graph with Supervisor node & dynamic tool routing.
  3. Enterprise LLM Guardrail Engine: Real-time hallucination prevention, prompt injection shield & PII scrubber.
  4. IMOT: Interactive Multi-Object Tracking in real-time video streams.
  5. Model Context Protocol (MCP) Service Mesh.

Guidelines:
- Keep answers concise, clear, and engaging (2 to 4 sentences).
- If asked for contact details or booking, mention his direct WhatsApp (+91 8984065377) and suggest booking a 1-on-1 strategy session via the Book button.
- Format key terms with bold text where appropriate.
"""

def call_gemini(prompt: str, api_key: str) -> Optional[str]:
    """Calls Google Gemini REST API using gemini-2.5-flash or gemini-1.5-flash."""
    models = ["gemini-2.5-flash", "gemini-1.5-flash"]
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "system_instruction": {
                    "parts": [{"text": SYSTEM_PERSONA}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 300
                }
            }
            res = requests.post(url, json=payload, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            continue
    return None

def call_groq(prompt: str, api_key: str) -> Optional[str]:
    """Calls Groq Cloud API using Llama 3.3 70B Versatile or Llama 3.1 8B Instant (Ultra-fast)."""
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    for model in models:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PERSONA},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            }
            res = requests.post(url, headers=headers, json=payload, timeout=10)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception:
            continue
    return None

def call_openai(prompt: str, api_key: str) -> Optional[str]:
    """Calls OpenAI Chat Completions API using gpt-4o-mini."""
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM_PERSONA},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None

# --- 8. AUTONOMOUS AI AGENT CONCIERGE ENDPOINT ---
@app.post("/api/agent/chat")
def agent_chat_endpoint(payload: AgentChatRequest):
    raw_message = (payload.message or payload.query or "").strip()
    if not raw_message:
        return {
            "reply": "Hello! I am Abhishek's AI Concierge. How can I assist you with his AI projects, architecture, or scheduling a strategy session?",
            "action": "general",
            "provider": "default"
        }
    
    user_input = raw_message.lower()
    action = "general"
    if "phone" in user_input or "whatsapp" in user_input or "urgent" in user_input or "call" in user_input or "reach" in user_input:
        action = "open_whatsapp"
    elif "book" in user_input or "appointment" in user_input or "consult" in user_input or "session" in user_input or "schedule" in user_input:
        action = "open_calendar"
    elif "project" in user_input or "researchmind" in user_input or "langgraph" in user_input:
        action = "view_projects"

    # 1. Try Groq API if key is available (Ultra-fast LPU inference)
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key and groq_key.strip():
        groq_reply = call_groq(raw_message, groq_key.strip())
        if groq_reply:
            return {
                "reply": groq_reply,
                "action": action,
                "provider": "Groq LPU (Llama 3.3)",
                "phone_number": "+918984065377",
                "timestamp": datetime.utcnow().isoformat()
            }

    # 2. Try Google Gemini API if key is available
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key and gemini_key.strip():
        gemini_reply = call_gemini(raw_message, gemini_key.strip())
        if gemini_reply:
            return {
                "reply": gemini_reply,
                "action": action,
                "provider": "Google Gemini",
                "phone_number": "+918984065377",
                "timestamp": datetime.utcnow().isoformat()
            }

    # 3. Try OpenAI API if key is available
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key.strip():
        openai_reply = call_openai(raw_message, openai_key.strip())
        if openai_reply:
            return {
                "reply": openai_reply,
                "action": action,
                "provider": "OpenAI",
                "phone_number": "+918984065377",
                "timestamp": datetime.utcnow().isoformat()
            }

    # 4. Built-in Autonomous Rule-Based Knowledge Engine (Comprehensive Offline & Fallback Engine)
    if action == "open_whatsapp" or any(w in user_input for w in ["contact", "email", "phone", "whatsapp", "call", "reach", "hire"]):
        reply = "You can reach Abhishek Sahoo directly on his phone / WhatsApp at <strong>+91 8984065377</strong> or via email at <strong>abhisheksahoo08583@gmail.com</strong>. You can also connect on <a href='https://www.linkedin.com/in/abhishek-sahoo-75519b313' target='_blank' style='color: var(--primary); font-weight:600;'>LinkedIn</a> or check his <a href='https://github.com/ai-genai-agenticai-intelligence' target='_blank' style='color: var(--primary); font-weight:600;'>GitHub</a>."
    elif action == "open_calendar" or any(w in user_input for w in ["book", "appointment", "schedule", "consult", "meeting", "interview"]):
        reply = "Opening the <strong>1-on-1 Strategy Session Calendar</strong> for you! You can pick an available slot and get an instant calendar invite (.ics)."
    elif "researchmind" in user_input:
        reply = "<strong>ResearchMind</strong> is an Autonomous Deep Research Multi-Agent system that searches, cross-validates, and synthesizes multi-source academic papers into comprehensive executive intelligence reports."
    elif "guardrail" in user_input:
        reply = "Abhishek's <strong>Enterprise LLM Guardrail Engine</strong> provides real-time hallucination prevention, prompt injection mitigation, and automated PII sanitization for enterprise AI deployments."
    elif "langgraph" in user_input or "multi-agent" in user_input or "agent" in user_input and "system" in user_input:
        reply = "Abhishek specializes in <strong>Stateful Multi-Agent LangGraph Architectures</strong> with Supervisor nodes, dynamic tool routing, Human-in-the-Loop checkpoints, and Model Context Protocol (MCP) integrations."
    elif "imot" in user_input or "tracking" in user_input or "vision" in user_input:
        reply = "<strong>IMOT (Interactive Multi-Object Tracking)</strong> is Abhishek's high-speed computer vision pipeline for real-time video streams with Kalman filters and YOLO/DeepSORT tracking."
    elif action == "view_projects" or any(w in user_input for w in ["project", "work", "portfolio", "built", "showcase"]):
        reply = "Abhishek has developed <strong>10 production-grade AI systems</strong> including <strong>ResearchMind</strong>, <strong>Multi-Node LangGraph Framework</strong>, <strong>Enterprise LLM Guardrails</strong>, and <strong>IMOT Object Tracking</strong>. Scrolling to the Projects section for you!"
    elif any(w in user_input for w in ["skill", "tech", "stack", "framework", "python", "tool"]):
        reply = "Abhishek's core tech stack includes <strong>LangGraph</strong>, <strong>Model Context Protocol (MCP)</strong>, <strong>FastAPI</strong>, <strong>PyTorch</strong>, <strong>OpenCV</strong>, <strong>Llama 3.3 / Groq LPU</strong>, <strong>Docker</strong>, and <strong>Responsible AI Guardrails</strong>."
    elif any(w in user_input for w in ["education", "college", "smit", "degree", "study", "studied", "university", "school", "graduate", "batch"]):
        reply = "Abhishek is pursuing his <strong>B.E. in Computer Science & Engineering (2022 - 2026)</strong> at <strong>Sikkim Manipal Institute of Technology (SMIT)</strong>, graduating in the Class of 2026."
    elif any(w in user_input for w in ["who are you", "what are you", "who is abhishek", "about abhishek", "bio"]):
        reply = "I am <strong>AbhiBot</strong>, the AI Concierge for Abhishek Sahoo. Abhishek is an <strong>AI & Agentic Systems Engineer</strong> specializing in autonomous multi-agent architectures, enterprise LLM guardrails, and cloud deployments."
    else:
        reply = "Abhishek Sahoo is an <strong>AI & Agentic Systems Engineer</strong> (SMIT B.E. '26) specializing in autonomous multi-agent workflows, LangGraph, and enterprise LLM integrations. Ask me about his 10 projects, skills, contact info, or click below to book a strategy session!"

    return {
        "reply": reply,
        "action": action,
        "provider": "Local Knowledge Engine",
        "phone_number": "+918984065377",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==============================================================================
# SERVE FRONTEND STATIC FILES (PORTABLE FOR CLOUD & LOCAL)
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

