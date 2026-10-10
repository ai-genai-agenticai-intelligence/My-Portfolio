"""
Generate Pixel-Perfect Professional 1-Page ATS Resume for Abhishek Sahoo
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos

class Resume(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=False)
        self.set_margins(left=14, top=9, right=14)

    def draw_heading(self, title):
        self.set_y(self.get_y() + 1.8)
        self.set_font("Helvetica", "B", 10.5)
        self.set_text_color(15, 23, 42)
        self.cell(0, 4.5, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        # Horizontal divider line
        self.set_draw_color(190, 195, 202)
        self.set_line_width(0.3)
        y = self.get_y() + 0.4
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.set_y(y + 1.2)

def build_resume():
    pdf = Resume()
    pdf.add_page()
    w = pdf.w - pdf.l_margin - pdf.r_margin

    # 1. HEADER (Centered)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6.5, "ABHISHEK SAHOO", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "B", 10.5)
    pdf.set_text_color(75, 85, 99)
    pdf.cell(0, 4.5, "AI Engineer", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(55, 65, 81)
    
    # Contact row 1
    pdf.cell(0, 4.0, "+91-8984065377   |   abhisheksahoo08583@gmail.com   |   linkedin.com/in/abhishek-sahoo-75519b313", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Contact row 2 (GitHub with link)
    pdf.set_text_color(0, 95, 175)
    pdf.cell(0, 4.0, "github.com/ai-genai-agenticai-intelligence", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT, link="https://github.com/ai-genai-agenticai-intelligence")
    pdf.set_text_color(30, 30, 30)

    # 2. SUMMARY
    pdf.draw_heading("Summary")
    pdf.set_font("Helvetica", "", 8.4)
    summary_text = (
        "AI Engineer skilled in Python, Machine Learning, Deep Learning, Generative AI, LLMs, RAG, SQL, TensorFlow, "
        "PyTorch, Scikit-learn, and LangChain. Experienced in building AI applications, predictive models, data pipelines, "
        "REST APIs, and intelligent solutions using Flask and Streamlit. Strong in EDA, feature engineering, model "
        "optimization, prompt engineering, and AI deployment."
    )
    pdf.multi_cell(w, 3.6, summary_text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # 3. TECHNICAL SKILLS
    pdf.draw_heading("Technical Skills")
    skills = [
        ("Programming:", "Python, SQL, MySQL, NumPy, Pandas, Matplotlib, Seaborn"),
        ("Data Science:", "Data Cleaning, EDA, Statistics, Feature Engineering, Visualization, Model Evaluation"),
        ("Machine Learning:", "Scikit-learn, Classification, Regression, Clustering, Hyperparameter Tuning"),
        ("Deep Learning:", "TensorFlow, Keras, PyTorch, ANN, CNN, RNN, LSTM, Transformers"),
        ("Computer Vision:", "OpenCV, MediaPipe, YOLO, Object Detection, Classification, Segmentation"),
        ("GenAI & LLMs:", "GPT, Claude, Gemini, LLaMA, RAG, Prompt Engineering, LoRA, QLoRA, AI Agents"),
        ("AI Frameworks:", "LangChain, LangGraph, LangSmith, Hugging Face, OpenAI API, CrewAI"),
        ("Databases:", "ChromaDB, Qdrant, Pinecone"),
        ("Deployment:", "Git, GitHub, Docker, FastAPI, Flask, Streamlit, Gradio"),
        ("BI & Tools:", "Power BI, Tableau, Excel, VS Code, Jupyter, Google Colab")
    ]

    bullet_w = 4.0
    for label, details in skills:
        curr_y = pdf.get_y()
        # Bullet dot
        pdf.set_font("Helvetica", "B", 8.2)
        pdf.set_text_color(30, 30, 30)
        pdf.cell(bullet_w, 3.45, "-", new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        # Bold label
        label_w = pdf.get_string_width(label + " ")
        pdf.cell(label_w, 3.45, label + " ", new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        # Details text
        pdf.set_font("Helvetica", "", 8.2)
        detail_w = w - bullet_w - label_w
        pdf.multi_cell(detail_w, 3.45, details, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        # Ensure next item starts below
        pdf.set_x(pdf.l_margin)

    # 4. PROJECTS
    pdf.draw_heading("Projects")

    projects = [
        {
            "title": "Enterprise IT Support Agentic RAG Copilot",
            "stack": "| LangGraph, FastAPI, Pinecone, Groq LLM, Agentic RAG",
            "bullets": [
                "Developed and deployed an enterprise IT Support Copilot using Agentic RAG workflows with LangGraph, FastAPI, Pinecone, and Groq LLM, enabling secure retrieval from private knowledge bases with fallback to external search.",
                "Implemented query routing, evidence grading, and retry logic to minimize hallucinations, improve answer grounding, and provide transparent decision-path auditing for 3,000+ employee use cases."
            ],
            "cloud": "enterprise-it-support-agentic-rag-copilot-n6e8.onrender.com"
        },
        {
            "title": "Autonomous Multi-Agent AI Research System",
            "stack": "| LangChain, Tavily, Groq, Gemini, OpenAI, Streamlit",
            "bullets": [
                "Designed and implemented an autonomous multi-agent research pipeline orchestrating Search, Reader, Writer, and Critic agents to produce citation-backed intelligence reports using LangChain, Tavily Search, and multi-provider LLMs (Groq, Gemini, OpenAI).",
                "Built dual runtime modes (Streamlit web dashboard and CLI pipeline) with automated peer-review scoring, deep web scraping, and transparent quality auditing for enterprise-grade research automation."
            ],
            "cloud": "multi-agent-research-assistant-1-jtam.onrender.com"
        },
        {
            "title": "Multi-Node Conversational AI Framework",
            "stack": "| LangGraph, Groq API, Streamlit, TypedDict, REST APIs",
            "bullets": [
                "Designed an asynchronous conversational pipeline using LangGraph StateGraph and TypedDict state schema to manage preprocessing, sentiment tagging, and conditional branch transitions.",
                "Integrated Groq-accelerated inference with streaming endpoints, maintaining context-rich conversation history across extended sessions with sub-second response times."
            ],
            "cloud": "multi-node-conversational-ai-framework.streamlit.app"
        }
    ]

    for p in projects:
        # Title
        pdf.set_font("Helvetica", "B", 8.6)
        pdf.set_text_color(15, 23, 42)
        title_str = p["title"] + " "
        title_w = pdf.get_string_width(title_str)
        pdf.cell(title_w, 4.0, title_str, new_x=XPos.RIGHT, new_y=YPos.TOP)
        
        # Stack
        pdf.set_font("Helvetica", "I", 7.9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(w - title_w, 4.0, p["stack"], new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Bullets
        pdf.set_font("Helvetica", "", 8.1)
        pdf.set_text_color(30, 30, 30)
        for b in p["bullets"]:
            pdf.cell(3.5, 3.4, "-", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.multi_cell(w - 3.5, 3.4, b, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            pdf.set_x(pdf.l_margin)

        # Cloud deployment link
        pdf.set_font("Helvetica", "B", 8.1)
        pdf.cell(3.5, 3.4, "-", new_x=XPos.RIGHT, new_y=YPos.TOP)
        cd_label = "Cloud Deployment: "
        pdf.cell(pdf.get_string_width(cd_label), 3.4, cd_label, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.set_font("Helvetica", "", 8.1)
        pdf.set_text_color(0, 95, 175)
        pdf.cell(w - 3.5 - pdf.get_string_width(cd_label), 3.4, p["cloud"], new_x=XPos.LMARGIN, new_y=YPos.NEXT, link=f"https://{p['cloud']}")
        pdf.set_text_color(30, 30, 30)
        pdf.set_x(pdf.l_margin)
        pdf.set_y(pdf.get_y() + 0.6)

    # 5. CERTIFICATIONS
    pdf.draw_heading("Certifications")
    pdf.set_font("Helvetica", "B", 8.4)
    pdf.set_text_color(15, 23, 42)
    cert_title = "Full Stack Data Science with Agentic AI "
    pdf.cell(pdf.get_string_width(cert_title), 3.8, cert_title, new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font("Helvetica", "", 8.3)
    pdf.set_text_color(55, 65, 81)
    inst = "| Naresh i Technologies"
    pdf.cell(pdf.get_string_width(inst), 3.8, inst, new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font("Helvetica", "B", 8.4)
    pdf.cell(w - pdf.get_string_width(cert_title) - pdf.get_string_width(inst), 3.8, "2026", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # 6. EDUCATION
    pdf.draw_heading("Education")
    
    # Row 1: College + Graduated Year
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_text_color(15, 23, 42)
    col_str = "SMIT Degree Engineering college"
    pdf.cell(pdf.get_string_width(col_str), 3.8, col_str, new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font("Helvetica", "", 8.3)
    pdf.set_text_color(55, 65, 81)
    grad_str = "Graduated: 2026"
    pdf.cell(w - pdf.get_string_width(col_str), 3.8, grad_str, align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Row 2: Degree + CGPA
    pdf.cell(pdf.get_string_width("Bachelor of Engineering (B.E)"), 3.8, "Bachelor of Engineering (B.E)", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font("Helvetica", "B", 8.3)
    pdf.cell(w - pdf.get_string_width("Bachelor of Engineering (B.E)"), 3.8, "CGPA: 7.96 / 10", align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.output("Abhishek_Sahoo_AI_Resume.pdf")
    print("PDF generation complete! Total pages:", pdf.page)

if __name__ == "__main__":
    build_resume()
