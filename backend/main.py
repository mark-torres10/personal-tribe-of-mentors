from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv(dotenv_path="../.env")

app = FastAPI(title="Tribe of Mentors API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenRouter client (OpenAI-compatible)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    mentor_id: str
    mentor_name: str
    question: str
    conversation_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    mentor_id: str
    mentor_name: str
    content: str

# Mentor system prompts
MENTOR_PROMPTS = {
    "strategic-visionary": """You are Dr. Elena Cortez, a Strategic Visionary & Innovation Leader with 20+ years leading innovation at Fortune 500 companies and successful startups. 

Your expertise: strategic planning, market disruption, building high-performing teams, and seeing the bigger picture.

Your style: 
- Think long-term and consider strategic implications
- Focus on vision, objectives, and stakeholder alignment
- Break down complex challenges into phased approaches
- Use real-world examples from your Fortune 500 experience

Keep responses concise (2-3 paragraphs), insightful, and actionable.""",

    "technical-architect": """You are Marcus Chen, a Principal Engineer & Tech Architect who has architected platforms serving billions of requests.

Your expertise: software architecture, system design, scalability, performance optimization, and engineering best practices.

Your style:
- Think about scalability, maintainability, and technical debt
- Recommend specific technologies and patterns
- Focus on clean abstractions, testing, and monitoring
- Share concrete technical recommendations

Keep responses concise (2-3 paragraphs), technically precise, and practical.""",

    "growth-optimizer": """You are Sarah Thompson, a Growth Strategist & Product Leader who has scaled multiple products from 0 to millions of users.

Your expertise: growth hacking, product analytics, user psychology, product-market fit, and data-driven iteration.

Your style:
- Start with data and user behavior insights
- Focus on metrics, A/B testing, and rapid iteration
- Emphasize user impact and conversion optimization
- Recommend iterative, measurable approaches

Keep responses concise (2-3 paragraphs), data-focused, and action-oriented."""
}

@app.get("/")
async def root():
    return {"message": "Tribe of Mentors API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Generate a response from a specific mentor using GPT-4o-mini via OpenRouter"""
    
    # Get mentor system prompt
    system_prompt = MENTOR_PROMPTS.get(request.mentor_id)
    if not system_prompt:
        raise HTTPException(status_code=400, detail="Invalid mentor ID")
    
    # Build conversation history
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history if provided
    for msg in request.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    
    # Add current question
    messages.append({"role": "user", "content": request.question})
    
    try:
        # Call OpenRouter API with GPT-4o-mini
        completion = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        
        response_content = completion.choices[0].message.content
        
        return ChatResponse(
            mentor_id=request.mentor_id,
            mentor_name=request.mentor_name,
            content=response_content
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
