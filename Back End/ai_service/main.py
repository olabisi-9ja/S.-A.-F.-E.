import asyncio
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="S.A.F.E AI Classification Service")

# Initialize the pipeline globally so it loads on startup
logger.info("Loading DistilBERT zero-shot classification model...")
try:
    # Use a smaller model for faster downloads and lower memory footprint on prototype
    classifier = pipeline("zero-shot-classification", model="typeform/distilbert-base-uncased-mnli")
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    classifier = None

class IncidentRequest(BaseModel):
    text: str

class IncidentResponse(BaseModel):
    category: str
    severity_score: int
    is_suspicious: bool

CANDIDATE_LABELS = [
    "Assault",
    "Theft",
    "Harassment",
    "Vandalism",
    "Fire",
    "Emergency / Medical",
    "Suspicious Activity"
]

SEVERITY_WEIGHTS = {
    "Fire": 95,
    "Emergency / Medical": 90,
    "Assault": 85,
    "Theft": 75,
    "Harassment": 70,
    "Suspicious Activity": 55,
    "Vandalism": 45
}

@app.post("/classify", response_model=IncidentResponse)
async def classify_incident(request: IncidentRequest):
    if not classifier:
        return IncidentResponse(
            category="General",
            severity_score=50,
            is_suspicious=False
        )

    text = request.text
    
    # Run zero-shot classification
    # Run in threadpool as pipeline call is blocking
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: classifier(text, CANDIDATE_LABELS))
    
    # Get the top predicted category
    top_category = result["labels"][0]
    confidence = result["scores"][0]
    
    # Calculate severity based on category weight and confidence
    base_severity = SEVERITY_WEIGHTS.get(top_category, 50)
    
    # Adjust severity slightly based on model confidence
    # If confidence is very high, it bumps up slightly. 
    severity_score = int(base_severity * (0.8 + (0.2 * confidence)))
    
    # Cap at 100
    severity_score = min(100, max(0, severity_score))
    
    # Determine if suspicious (low confidence or specifically flagged)
    is_suspicious = top_category == "Suspicious Activity" or confidence < 0.3
    
    return IncidentResponse(
        category=top_category,
        severity_score=severity_score,
        is_suspicious=is_suspicious
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
