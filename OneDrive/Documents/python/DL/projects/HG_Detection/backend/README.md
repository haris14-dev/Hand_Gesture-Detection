# Backend - FastAPI

Production-ready backend API for hand gesture recognition.

## Features

- ⚡ FastAPI with async support
- 🤖 PyTorch model inference
- 📊 Real-time predictions with confidence scores
- 🔄 CORS enabled for web access
- 📝 Auto-generated API documentation (Swagger UI)
- 🏥 Health check endpoints
- 🚀 Production-ready with Uvicorn

## Quick Start

```bash
pip install -r requirements.txt
python api.py
```

API will be available at `http://localhost:8000`

Access Swagger UI at `http://localhost:8000/docs`

## Environment Variables

```bash
# Optional - set CUDA device
export CUDA_VISIBLE_DEVICES=0
```

## API Endpoints

### POST /predict
Send image for gesture prediction

```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@image.jpg"
```

Response:
```json
{
  "gesture": "Fist",
  "confidence": 0.92,
  "probabilities": {
    "Fist": 0.92,
    "Thumb up": 0.05,
    "palm": 0.03
  },
  "device": "cuda"
}
```

### GET /health
Health check

```bash
curl http://localhost:8000/health
```

### GET /classes
Get available gesture classes

```bash
curl http://localhost:8000/classes
```

### GET /info
API information

```bash
curl http://localhost:8000/info
```

## Deployment

### Local Development
```bash
python api.py
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 api:app
```

### Docker
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY api.py .
COPY gesture_model.pth .

EXPOSE 8000
CMD ["python", "api.py"]
```

Then:
```bash
docker build -t gesture-api .
docker run -p 8000:8000 gesture-api
```

### Deploy to Railway, Render, or Heroku
1. Ensure gesture_model.pth is in the same directory
2. Set environment variables if needed
3. Run `api.py` as the start command

## Performance

- Inference time: ~30-50ms per image
- Model size: ~14 MB (MobileNetV2)
- GPU support: Automatic CUDA detection
- Batch predictions: Can be added for throughput
