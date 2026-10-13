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

class ChatMessage(BaseModel):
    role: str
    content: str

class AgentChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    client_name: Optional[str] = "Anonymous Visitor"
    history: Optional[List[ChatMessage]] = []

# --- SYSTEM PERSONA KNOWLEDGE BASE ---
SYSTEM_PERSONA = """You are AbhiBot, the production-grade Autonomous AI Concierge for Abhishek Sahoo's official portfolio.
You represent Abhishek Sahoo (AI & Agentic Systems Engineer, SMIT B.E CSE 2022-2026) warmly, professionally, and accurately.

Key Profile Knowledge:
- Title: AI & Agentic Systems Engineer
- Education: B.E. in Computer Science & Engineering (2022 - 2026) at Sikkim Manipal Institute of Technology (SMIT)
- Core Expertise: Autonomous Multi-Agent Workflows, LangGraph, Model Context Protocol (MCP), Responsible AI Guardrails, Agentic RAG, FastAPI, PyTorch, Computer Vision (YOLO/IMOT), and Business Intelligence & Analytics.
- Direct Contact: Phone / WhatsApp: +91 8984065377, Email: abhisheksahoo08583@gmail.com, LinkedIn: linkedin.com/in/abhishek-sahoo-75519b313, GitHub: github.com/ai-genai-agenticai-intelligence

Key 13 Live Deployments:
1. Enterprise IT Support Agentic RAG Copilot: LangGraph state machine, Pinecone vector store, dynamic fallback search, real-time decision tracing.
2. ResearchMind: Deep Research Multi-Agent system for multi-paper academic synthesis.
3. Multi-Node LangGraph Framework: Supervisor pattern, dynamic routing, stateful execution.
4. MCP Supervisor Guardrails & HITL: Model Context Protocol with human-in-the-loop validation.
5. Enterprise LLM Guardrail Engine: Hallucination mitigation, prompt injection defense, PII sanitization.
6. AI Resume Analyzer & Job Fit Predictor: Match scoring, skill extraction, ATS optimization.
7. Gemini 2.5 Flash Chatbot: Ultra-low latency conversational assistant.
8. IMOT (Multi-Modal Object & Color Tracking): YOLO + DeepSORT real-time vision tracking.
9. ImageNet Deep Learning (VGG16 / ResNet50): Fine-tuned multi-class visual recognition.
10. CNN Facial Mood Classification: Emotion detection neural network.
11. E-Commerce Financial Performance Dashboard: Streamlit + Plotly modeling revenues, margins, and unit economics (https://e-commerce-financial-performance-app.streamlit.app).
12. Website Performance & Traffic Analytics: Real-time telemetry, bounce rates & conversion funnels (https://website-performance-analytics-app.streamlit.app).
13. Netflix Global Movie Analysis: Catalog trends, runtime clusters & director networks (https://netflix-movie-analysis-app.streamlit.app).

Response Style:
- Professional, concise, actionable (2-4 sentences max per response).
- Use HTML formatting where appropriate (<strong>bold</strong>, <a href="...">links</a>).
- Recommend scheduling a 1-on-1 strategy session or messaging on WhatsApp (+91 8984065377) when relevant.
"""

def call_gemini(prompt: str, api_key: str, history: List[ChatMessage] = None) -> Optional[str]:
    """Calls Google Gemini REST API with strict turn alternation."""
    models = ["gemini-2.0-flash", "gemini-1.5-flash"]
    contents = []
    
    if history:
        last_role = None
        for msg in history[-6:]:
            role = "user" if msg.role == "user" else "model"
            if role == last_role and contents:
                contents[-1]["parts"].append({"text": msg.content})
            else:
                contents.append({"role": role, "parts": [{"text": msg.content}]})
                last_role = role

    if contents and contents[-1]["role"] == "user":
        contents[-1]["parts"].append({"text": prompt})
    else:
        contents.append({"role": "user", "parts": [{"text": prompt}]})

    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            payload = {
                "system_instruction": {
                    "parts": [{"text": SYSTEM_PERSONA}]
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 380
                }
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            continue
    return None

def call_groq(prompt: str, api_key: str, history: List[ChatMessage] = None) -> Optional[str]:
    """Calls Groq Cloud API with Llama 3.3 70B."""
    messages = [{"role": "system", "content": SYSTEM_PERSONA}]
    if history:
        for msg in history[-6:]:
            role = "assistant" if msg.role in ["bot", "model", "assistant"] else "user"
            messages.append({"role": role, "content": msg.content})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    for model in models:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 380
            }
            res = requests.post(url, headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception:
            continue
    return None

def call_openai(prompt: str, api_key: str, history: List[ChatMessage] = None) -> Optional[str]:
    """Calls OpenAI Chat Completions."""
    messages = [{"role": "system", "content": SYSTEM_PERSONA}]
    if history:
        for msg in history[-6:]:
            role = "assistant" if msg.role in ["bot", "model", "assistant"] else "user"
            messages.append({"role": role, "content": msg.content})
    messages.append({"role": "user", "content": prompt})

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.6,
            "max_tokens": 380
        }
        res = requests.post(url, headers=headers, json=payload, timeout=8)
        if res.status_code == 200:
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception:
        pass
    return None

import re

def has_intent(text: str, patterns: List[str]) -> bool:
    """Checks for whole-word or phrase matches to avoid substring false positives (e.g. 'hi' inside 'abhishek')."""
    text_lower = text.lower()
    for pattern in patterns:
        p = pattern.lower().strip()
        if " " in p or "-" in p:
            if p in text_lower:
                return True
        else:
            if re.search(r'\b' + re.escape(p) + r'\b', text_lower):
                return True
    return False

def resolve_semantic_intent(raw_message: str) -> dict:
    """Production zero-latency semantic intent engine for AbhiBot with rich actionable responses."""
    user_input = (raw_message or "").strip().lower()
    if not user_input:
        return {
            "reply": "Hello! I am <strong>AbhiBot</strong>, Abhishek Sahoo's AI Concierge. How can I help you explore his 13 live production systems, review his Multi-Agent LangGraph architecture, or schedule an executive strategy session?",
            "action": "general",
            "suggested_chips": ["🚀 Show 13 Projects", "🤖 LangGraph & Agents", "📊 Analytics Dashboards", "📅 Book Strategy Call", "📞 Contact Abhishek"]
        }

    # 1. Booking & Scheduling Strategy Session
    if has_intent(user_input, ["book", "booking", "schedule", "appointment", "consultation", "meeting", "interview", "calendar", "strategy session", "strategy call", "1-on-1", "1:1", "session"]):
        return {
            "reply": "Opening the <strong>1-on-1 Strategy Session Calendar</strong> for you! You can pick your preferred date and time, and instantly receive a calendar invite (.ics).<br><div class='chat-actions-row'><button class='chat-action-btn book-session-trigger'><i data-lucide='calendar'></i> Open Booking Modal</button><a href='https://wa.me/918984065377' target='_blank' class='chat-action-btn'><i data-lucide='phone'></i> Direct WhatsApp</a></div>",
            "action": "open_calendar",
            "suggested_chips": ["🚀 Show 13 Projects", "🤖 Multi-Agent Systems", "📞 Direct WhatsApp"]
        }

    # 2. Contact & Direct Reach
    if has_intent(user_input, ["contact", "reach", "hire", "email", "phone", "whatsapp", "call", "message", "get in touch", "connect"]):
        return {
            "reply": "You can connect with Abhishek directly on WhatsApp / Phone at <strong>+91 8984065377</strong> or email him at <strong>abhisheksahoo08583@gmail.com</strong>.<br><div class='chat-actions-row'><a href='https://wa.me/918984065377' target='_blank' class='chat-action-btn'><i data-lucide='message-circle'></i> Open WhatsApp Chat</a><a href='https://www.linkedin.com/in/abhishek-sahoo-75519b313' target='_blank' class='chat-action-btn'><i data-lucide='linkedin'></i> View LinkedIn</a></div>",
            "action": "open_whatsapp",
            "suggested_chips": ["📅 Book 1:1 Session", "🚀 View All 13 Projects", "💻 View Tech Stack"]
        }

    # 3. Resume & CV Download
    if has_intent(user_input, ["resume", "cv", "curriculum", "download resume", "pdf", "bio"]):
        return {
            "reply": "You can view and download Abhishek Sahoo's official <strong>AI & Agentic Systems Engineer Resume (PDF)</strong> detailing his Naresh i Tech experience, 13 live deployments, and credentials.<br><div class='chat-actions-row'><a href='Abhishek_Sahoo_AI_Resume.pdf' download='Abhishek_Sahoo_AI_Resume.pdf' class='chat-action-btn'><i data-lucide='download'></i> Download Official Resume (PDF)</a><a href='https://www.linkedin.com/in/abhishek-sahoo-75519b313' target='_blank' class='chat-action-btn'><i data-lucide='linkedin'></i> LinkedIn Profile</a></div>",
            "action": "download_resume",
            "suggested_chips": ["📅 Book 1:1 Session", "🚀 View All 13 Projects", "📞 Contact Abhishek"]
        }

    # 4. Work Experience & Internship
    if has_intent(user_input, ["experience", "intern", "internship", "work history", "naresh i tech", "career", "job", "company"]):
        return {
            "reply": "Abhishek completed a rigorous <strong>Data Science & Agentic AI Engineer Internship at Naresh i Tech (Hyderabad)</strong>. He built enterprise multi-agent LangGraph workflows, optimized semantic search latency by 35% with vector caching, fine-tuned deep learning models to 97.2%+ benchmark accuracy, and deployed cloud production systems.",
            "action": "general",
            "suggested_chips": ["🤖 Multi-Agent Systems", "🛡️ LLM Guardrails", "📄 Download Resume", "📅 Book Strategy Call"]
        }

    # 5. Education & Academic Background
    if has_intent(user_input, ["education", "college", "smit", "degree", "university", "school", "graduate", "cgpa", "academics"]):
        return {
            "reply": "Abhishek is pursuing his <strong>B.E. in Computer Science & Engineering (2022 - 2026)</strong> at <strong>Sikkim Manipal Institute of Technology (SMIT)</strong>, focusing on Distributed Systems, Multi-Agent Architectures, and Responsible AI.",
            "action": "general",
            "suggested_chips": ["💼 View Tech Stack", "🚀 View 13 Projects", "📞 Direct Contact"]
        }

    # 6. Certifications & Verified Credentials
    if has_intent(user_input, ["certification", "certifications", "certificate", "certificates", "courses", "deeplearning.ai", "credentials"]):
        return {
            "reply": "Abhishek holds verified certifications in <strong>Machine Learning Specialization (DeepLearning.AI / Stanford)</strong>, <strong>Deep Learning & Generative AI</strong>, and <strong>PyTorch & TensorFlow</strong> foundations.",
            "action": "general",
            "suggested_chips": ["💼 Tech Stack", "🚀 13 Live Projects", "📄 Download Resume"]
        }

    # 7. Enterprise IT Support Agentic RAG Copilot
    if has_intent(user_input, ["copilot", "it support", "support agent", "rag", "pinecone"]):
        return {
            "reply": "<strong>Enterprise IT Support: Agentic RAG Copilot</strong> is Abhishek's flagship enterprise support system. It combines <strong>LangGraph state machines</strong>, <strong>Pinecone vector indexing</strong>, dynamic fallback search, and real-time execution tracing for enterprise IT troubleshooting.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> View Project Card</a></div>",
            "action": "view_project",
            "suggested_chips": ["🔬 ResearchMind System", "🤖 Multi-Node LangGraph", "📅 Book Strategy Call"]
        }

    # 8. ResearchMind Autonomous Research
    if has_intent(user_input, ["researchmind", "deep research", "academic synthesis", "multi-paper"]):
        return {
            "reply": "<strong>ResearchMind</strong> is an Autonomous Deep Research Multi-Agent pipeline. It autonomously retrieves multi-source academic papers, resolves contradictions, validates sources, and compiles executive intelligence briefs.",
            "action": "view_project",
            "suggested_chips": ["🚀 Multi-Node LangGraph", "🛡️ LLM Guardrails", "📞 Contact Abhishek"]
        }

    # 9. LangGraph & Multi-Agent Architectures
    if has_intent(user_input, ["langgraph", "multi-agent", "agentic", "supervisor", "mcp", "model context protocol", "hitl", "human in the loop", "multi node"]):
        return {
            "reply": "Abhishek specializes in <strong>Multi-Agent LangGraph Architectures</strong> featuring Supervisor nodes, stateful cycles, Human-in-the-Loop checkpoints, and Model Context Protocol (MCP) tool integrations for autonomous enterprise agents.",
            "action": "general",
            "suggested_chips": ["🚀 Enterprise IT Copilot", "🔬 ResearchMind Agent", "📅 Schedule Strategy Session"]
        }

    # 10. LLM Guardrails & Responsible AI
    if has_intent(user_input, ["guardrail", "guardrails", "responsible ai", "prompt injection", "pii", "hallucination", "safety"]):
        return {
            "reply": "Abhishek's <strong>Enterprise LLM Guardrail Engine</strong> delivers millisecond-level hallucination detection, prompt injection mitigation, and automated PII sanitization to make LLMs enterprise-grade and production-ready.",
            "action": "general",
            "suggested_chips": ["🤖 LangGraph Supervisor", "💼 Resume Analyzer", "📅 Book 1:1 Consultation"]
        }

    # 11. Computer Vision & Deep Learning
    if has_intent(user_input, ["vision", "cv", "imot", "yolo", "tracking", "imagenet", "cnn", "mood", "computer vision"]):
        return {
            "reply": "In Computer Vision & Deep Learning, Abhishek has built <strong>IMOT (Multi-Modal Object & Color Tracking)</strong> with YOLO & DeepSORT, <strong>ImageNet Visual Recognition (VGG16 / ResNet50)</strong>, and <strong>CNN Facial Mood Detection</strong>.<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> Jump to Vision Projects</a></div>",
            "action": "general",
            "suggested_chips": ["🤖 Agentic Systems", "📊 Analytics Dashboards", "📞 Contact Abhishek"]
        }

    # 12. Business Intelligence & Analytics Dashboards
    if has_intent(user_input, ["analytics", "bi", "dashboard", "dashboards", "business intelligence", "ecommerce", "e-commerce", "financial performance", "website performance", "traffic analytics", "netflix", "movie analysis", "streamlit"]):
        return {
            "reply": "Abhishek has deployed <strong>3 live Streamlit Cloud analytics suites</strong>:<br>• <strong>E-Commerce Financial Performance</strong>: Unit economics & margin modeling<br>• <strong>Website Performance & Traffic Telemetry</strong>: Real-time latency & funnel analysis<br>• <strong>Netflix Global Movie Analysis</strong>: Catalog dynamics & director networks<br><div class='chat-actions-row'><a href='https://e-commerce-financial-performance-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> E-Commerce App</a><a href='https://website-performance-analytics-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Website App</a><a href='https://netflix-movie-analysis-app.streamlit.app' target='_blank' class='chat-action-btn'><i data-lucide='external-link'></i> Netflix App</a></div>",
            "action": "general",
            "suggested_chips": ["🚀 View All 13 Projects", "🤖 LangGraph & Agents", "📅 Book Strategy Call"]
        }

    # 13. AI Resume Analyzer
    if has_intent(user_input, ["resume analyzer", "ats", "job fit"]):
        return {
            "reply": "The <strong>AI Resume Analyzer & Job Fit Predictor</strong> evaluates applicant CVs against target job descriptions using dense vector embeddings and semantic parsing to provide ATS scores and skill gap insights.",
            "action": "general",
            "suggested_chips": ["🚀 View Projects", "🤖 Gemini Chatbot", "📅 Book 1:1 Session"]
        }

    # 14. Gemini Chatbot
    if has_intent(user_input, ["gemini chatbot", "gemini 2.5", "gemini 2.0", "gemini flash", "gemini"]):
        return {
            "reply": "The <strong>Gemini Flash Chatbot</strong> provides ultra-low latency conversational intelligence with streaming responses and contextual persona alignment.",
            "action": "general",
            "suggested_chips": ["🤖 LangGraph Agents", "🛡️ LLM Guardrails", "📅 Book 1:1 Session"]
        }

    # 15. Projects Overview / Showcase
    if has_intent(user_input, ["project", "projects", "work", "portfolio", "built", "showcase", "systems"]):
        return {
            "reply": "Abhishek has engineered and deployed <strong>13 production-grade systems</strong> across 4 domains: Multi-Agent LangGraph (4), LLM Guardrails & GenAI (3), Computer Vision (3), and Analytics Dashboards (3).<br><div class='chat-actions-row'><a href='#projects' class='chat-action-btn'><i data-lucide='grid'></i> Jump To Projects Grid</a></div>",
            "action": "view_projects",
            "suggested_chips": ["🤖 Multi-Agent (4)", "🛡️ LLM & GenAI (3)", "👁️ Computer Vision (3)", "📊 Data Analytics (3)"]
        }

    # 16. Technical Stack & Skills
    if has_intent(user_input, ["skill", "skills", "tech", "stack", "framework", "tools", "python", "pytorch", "fastapi", "technologies", "languages"]):
        return {
            "reply": "Abhishek's technical stack includes: <strong>LangGraph & Multi-Agent Workflows</strong>, <strong>Agentic RAG & Pinecone</strong>, <strong>Model Context Protocol (MCP)</strong>, <strong>FastAPI & Python</strong>, <strong>PyTorch & OpenCV</strong>, <strong>Responsible AI Guardrails</strong>, and <strong>Streamlit & Tableau BI</strong>.",
            "action": "general",
            "suggested_chips": ["🚀 View 13 Projects", "📅 Schedule Strategy Session", "💬 WhatsApp Chat"]
        }

    # 17. Who is Abhishek / Profile
    if has_intent(user_input, ["who is abhishek", "about abhishek", "who are you", "tell me about yourself", "tell me about abhishek", "introduce abhishek", "profile"]):
        return {
            "reply": "Abhishek Sahoo is an <strong>AI & Agentic Systems Engineer</strong> (SMIT B.E. CSE 2026) building autonomous multi-agent systems, enterprise RAG copilots, and responsible AI guardrails. He has deployed 13 live cloud systems and interned at Naresh i Tech.",
            "action": "general",
            "suggested_chips": ["🚀 Show 13 Projects", "📄 Download Resume", "💼 View Tech Stack", "📅 Book Strategy Call"]
        }

    # 18. Greetings
    if has_intent(user_input, ["hi", "hello", "hey", "hola", "namaste", "greetings", "good morning", "good evening", "good afternoon"]):
        return {
            "reply": "Hello! 👋 I am <strong>AbhiBot</strong>, Abhishek Sahoo's AI Concierge. I can guide you through his <strong>13 live production systems</strong>, break down his multi-agent architecture, or help you book an executive strategy call. How can I assist you today?",
            "action": "general",
            "suggested_chips": ["🚀 Explore 13 Projects", "🤖 LangGraph & Agents", "📊 Live Analytics Dashboards", "📅 Book 1:1 Strategy Call"]
        }

    # 19. Goodbye / Thanks
    if has_intent(user_input, ["bye", "goodbye", "see you", "thanks", "thank you"]):
        return {
            "reply": "You're very welcome! Feel free to book a 1-on-1 strategy call or message Abhishek on WhatsApp (+91 8984065377) anytime. Have an inspiring day!",
            "action": "general",
            "suggested_chips": ["📅 Book 1:1 Session", "📞 WhatsApp Abhishek", "🚀 View Projects"]
        }

    # Default Fallback
    return {
        "reply": "Abhishek Sahoo is an <strong>AI & Agentic Systems Engineer</strong> (SMIT B.E. 2026) building autonomous multi-agent pipelines, enterprise RAG copilots, and responsible AI guardrails. Feel free to ask about his 13 live systems, tech stack, or book a strategy session!",
        "action": "general",
        "suggested_chips": ["🚀 Show 13 Projects", "📄 Download Resume", "🤖 LangGraph Architecture", "📅 Book Strategy Call"]
    }

# --- 8. AUTONOMOUS AI AGENT CONCIERGE ENDPOINT ---
@app.post("/api/agent/chat")
def agent_chat_endpoint(payload: AgentChatRequest):
    raw_message = (payload.message or payload.query or "").strip()
    if not raw_message:
        return {
            "reply": "Hello! I am <strong>AbhiBot</strong>, Abhishek's AI Concierge. How can I help you explore his 13 live systems, tech stack, or schedule an executive strategy session?",
            "action": "general",
            "provider": "default",
            "suggested_chips": ["🚀 Show 13 Projects", "🤖 LangGraph & Agents", "📊 Analytics Dashboards", "📅 Book Strategy Call", "📞 Contact Abhishek"]
        }

    # First check semantic action for UI coordination
    semantic_result = resolve_semantic_intent(raw_message)
    action = semantic_result.get("action", "general")
    action_data = semantic_result.get("action_data", {})
    suggested_chips = semantic_result.get("suggested_chips", ["🚀 Show 13 Projects", "📅 Book Strategy Call", "📞 Direct WhatsApp"])

    # 1. Try Groq API (Ultra-fast LPU inference)
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key and groq_key.strip():
        groq_reply = call_groq(raw_message, groq_key.strip(), payload.history)
        if groq_reply:
            return {
                "reply": groq_reply,
                "action": action,
                "action_data": action_data,
                "provider": "Groq LPU (Llama 3.3 70B)",
                "phone_number": "+918984065377",
                "suggested_chips": suggested_chips,
                "timestamp": datetime.utcnow().isoformat()
            }

    # 2. Try Google Gemini API
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key and gemini_key.strip():
        gemini_reply = call_gemini(raw_message, gemini_key.strip(), payload.history)
        if gemini_reply:
            return {
                "reply": gemini_reply,
                "action": action,
                "action_data": action_data,
                "provider": "Google Gemini 2.0 Flash",
                "phone_number": "+918984065377",
                "suggested_chips": suggested_chips,
                "timestamp": datetime.utcnow().isoformat()
            }

    # 3. Try OpenAI API
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key.strip():
        openai_reply = call_openai(raw_message, openai_key.strip(), payload.history)
        if openai_reply:
            return {
                "reply": openai_reply,
                "action": action,
                "action_data": action_data,
                "provider": "OpenAI GPT-4o Mini",
                "phone_number": "+918984065377",
                "suggested_chips": suggested_chips,
                "timestamp": datetime.utcnow().isoformat()
            }

    # 4. Built-in Enterprise Knowledge & Semantic Intent Engine (Zero-Latency Offline Fallback)
    return {
        "reply": semantic_result["reply"],
        "action": action,
        "action_data": action_data,
        "provider": "AbhiBot Autonomous Engine",
        "phone_number": "+918984065377",
        "suggested_chips": suggested_chips,
        "timestamp": datetime.utcnow().isoformat()
    }


# ==============================================================================
# RESUME DOWNLOAD ROUTE
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/api/resume")
@app.get("/api/resume/download")
@app.get("/resume.pdf")
@app.get("/Abhishek_Sahoo_Resume.pdf")
async def download_resume():
    resume_path = os.path.join(BASE_DIR, "Abhishek_Sahoo_AI_Resume.pdf")
    if os.path.exists(resume_path):
        return FileResponse(
            path=resume_path,
            filename="Abhishek_Sahoo_AI_Systems_Engineer_Resume.pdf",
            media_type="application/pdf"
        )
    return JSONResponse(status_code=404, content={"error": "Resume file not found"})


# ==============================================================================
# SERVE FRONTEND STATIC FILES (PORTABLE FOR CLOUD & LOCAL)
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

