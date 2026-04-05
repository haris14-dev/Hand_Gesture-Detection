from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import uvicorn
import os
from pathlib import Path
import cv2
import numpy as np

# ============= Hand Detection Setup =============

def segment_hand(image: Image.Image) -> Image.Image:
    """
    Segment hand using skin color detection and morphological operations.
    Creates a white background around the hand for better model robustness.
    """
    try:
        # Convert PIL to cv2 format
        img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to HSV for better skin detection
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        
        # Define skin color range in HSV
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        # Create mask for skin color
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Also check for higher hue values (some skin tones)
        lower_skin2 = np.array([160, 20, 70], dtype=np.uint8)
        upper_skin2 = np.array([180, 255, 255], dtype=np.uint8)
        mask2 = cv2.inRange(hsv, lower_skin2, upper_skin2)
        mask = cv2.bitwise_or(mask, mask2)
        
        # Morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            # If no skin detected, return original image
            return image
        
        # Get largest contour (hand)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Create mask for just the hand
        hand_mask = np.zeros_like(mask)
        cv2.drawContours(hand_mask, [largest_contour], 0, 255, -1)
        
        # Dilate to ensure full hand coverage
        hand_mask = cv2.dilate(hand_mask, kernel, iterations=2)
        
        # Create white background
        result = np.ones_like(img_cv) * 255
        
        # Copy hand region from original image
        result[hand_mask == 255] = img_cv[hand_mask == 255]
        
        # Convert back to PIL
        result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
        return Image.fromarray(result_rgb)
        
    except Exception as e:
        print(f"[WARNING] Hand segmentation failed: {e}. Using original image.")
        return image

# ============= Model Setup =============

class HandGestureModel(nn.Module):
    def __init__(self, num_classes=3):
        super(HandGestureModel, self).__init__()
        # Use pretrained weights - CRITICAL for model accuracy!
        self.backbone = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V2)
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(self.backbone.last_channel, num_classes)
        )
    
    def forward(self, x):
        return self.backbone(x)

# Initialize model
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASSES = ["Fist", "Thumb up", "palm"]  # MUST match alphabetical order from training (ImageFolder sorts alphabetically)
NUM_CLASSES = len(CLASSES)

model = HandGestureModel(num_classes=NUM_CLASSES).to(DEVICE)

# Load model weights
model_path = Path(__file__).parent.parent / "gesture_model.pth"
if model_path.exists():
    checkpoint = torch.load(model_path, map_location=DEVICE)
    model.load_state_dict(checkpoint)
    model.eval()
    print(f"✓ Model loaded from {model_path}")
else:
    print(f"⚠ Warning: Model not found at {model_path}")
    print(f"   Please ensure gesture_model.pth exists in the parent directory")

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])

# ============= FastAPI Setup =============

app = FastAPI(
    title="Hand Gesture Recognition API",
    description="Real-time hand gesture detection API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= Routes =============

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "device": str(DEVICE),
        "classes": CLASSES,
        "model_loaded": True
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict hand gesture from uploaded image
    
    Args:
        file: Image file (JPG, PNG)
    
    Returns:
        JSON with gesture, confidence, and probabilities
    """
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Segment hand from background for better robustness
        image = segment_hand(image)
        
        # Preprocess - MUST match training preprocessing exactly
        img_tensor = transform(image).unsqueeze(0).to(DEVICE)
        
        # Predict with no gradient
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
            confidence, pred_idx = torch.max(probabilities, 0)
        
        # Format response
        pred_class = CLASSES[pred_idx.item()]
        conf_value = confidence.item()
        
        prob_dict = {cls: float(prob) for cls, prob in zip(CLASSES, probabilities)}
        
        # Debug output
        print(f"[PREDICT] {pred_class}: {conf_value:.2%} | Probs: {prob_dict}")
        
        return {
            "gesture": pred_class,
            "confidence": conf_value,
            "probabilities": prob_dict,
            "device": str(DEVICE)
        }
    
    except Exception as e:
        print(f"[ERROR] Prediction failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.get("/classes")
async def get_classes():
    """Get available gesture classes"""
    return {
        "classes": CLASSES,
        "num_classes": NUM_CLASSES
    }

@app.get("/info")
async def info():
    """Get API information"""
    return {
        "name": "Hand Gesture Recognition API",
        "version": "1.0.0",
        "device": str(DEVICE),
        "classes": CLASSES,
        "model": "MobileNetV2",
        "endpoints": {
            "POST /predict": "Predict gesture from image",
            "GET /classes": "Get available classes",
            "GET /health": "Health check",
            "GET /info": "API information"
        }
    }

# ============= Startup/Shutdown =============

@app.on_event("startup")
async def startup():
    print("\n" + "="*50)
    print("Hand Gesture Recognition API")
    print("="*50)
    print(f"Device: {DEVICE}")
    print(f"Classes: {CLASSES}")
    print(f"Model: MobileNetV2")
    print("="*50 + "\n")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
