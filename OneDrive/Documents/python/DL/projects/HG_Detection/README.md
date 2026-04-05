# Gesture Engine - Complete Suite

Professional hand gesture recognition system with top-tier frontend and production backend.

## 📁 Project Structure

```
HG_Detection/
├── frontend/                      # Next.js web app
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   └── GestureDetector.tsx   # Main component
│   ├── styles/
│   │   └── globals.css           # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── vercel.json              # Vercel config
│   └── README.md
│
├── backend/                       # FastAPI backend
│   ├── api.py                    # Main API
│   ├── requirements.txt          # Python dependencies
│   └── README.md
│
├── dataset/                       # Training dataset
│   ├── Fist/
│   ├── Thumb up/
│   └── palm/
│
├── gesture_model.pth            # Trained model
├── code.py                       # Training code
├── predict.py                    # Prediction script
├── making-dataset.py            # Dataset creation
│
├── Dockerfile                    # Container config
├── docker-compose.yml           # Local dev config
├── DEPLOYMENT_GUIDE.md          # Complete deployment guide
└── README.md                     # This file
```

## 🎯 Features

### Frontend (Next.js + TypeScript + Tailwind)
- ✨ Modern, responsive UI with animations
- 🎥 Real-time webcam streaming (60+ FPS)
- 📊 Live probability distribution
- 📈 Prediction history tracking
- 🔥 Production-ready performance
- ♿ Accessible components (WCAG)
- 📱 Mobile-optimized
- 🌓 Dark mode (default)

### Backend (FastAPI + PyTorch)
- ⚡ Async request handling
- 🤖 Real-time inference (30-50ms)
- 📝 Auto-generated API docs (Swagger UI)
- 🔄 CORS enabled
- 🏥 Health checks
- 🚀 Production-ready
- 📊 Model: MobileNetV2 (14 MB)
- 🎓 3-class gesture recognition

## 🚀 Quick Start

### Local Development (5 minutes)

#### Using Docker Compose (Easiest)
```bash
# Start both frontend and backend
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Manual Setup
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python api.py
# Listening on http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

## 📦 Deployment

### Quick Deploy to Vercel (2 minutes)

**Frontend:**
```bash
cd frontend
vercel deploy
```

**Backend:** Deploy to Railway/Render (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))

### Full Deployment Guide
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- ✅ Step-by-step Vercel deployment
- ✅ Backend hosting options (Railway, Render, Docker)
- ✅ Custom domain setup
- ✅ Environment configuration
- ✅ Troubleshooting

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **ML Framework**: PyTorch
- **Model**: MobileNetV2
- **Hosting**: Railway/Render/Docker

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions (optional)

## 📊 API Reference

### Health Check
```bash
GET /health
```

### Predict Gesture
```bash
POST /predict
Content-Type: multipart/form-data

Response:
{
  "gesture": "Fist",
  "confidence": 0.92,
  "probabilities": {
    "Fist": 0.92,
    "Thumb up": 0.05,
    "palm": 0.03
  }
}
```

### Get Classes
```bash
GET /classes

Response:
{
  "classes": ["Fist", "Thumb up", "palm"],
  "num_classes": 3
}
```

See full API docs at http://localhost:8000/docs (Swagger UI)

## 🎥 Usage

1. **Open the app** at http://localhost:3000 (or Vercel URL)
2. **Allow camera permissions** when prompted
3. **Click "Start Detection"** button
4. **Make gestures** in front of camera
5. **View results** in real-time with confidence scores
6. **Check history** of recent predictions

## ⚙️ Configuration

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend URL
```

### Backend Environment Variables
```
PYTHONUNBUFFERED=1           # Real-time logging
CUDA_VISIBLE_DEVICES=0       # GPU support (optional)
```

## 🔍 Troubleshooting

**Camera not working?**
- Ensure HTTPS is used (Vercel provides this)
- Check browser permissions
- Allow camera access when prompted

**API connection error?**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is enabled in backend
- Check browser console for details

**Slow predictions?**
- Enable GPU if available
- Check network latency
- Monitor backend load

## 📚 Documentation

- [Frontend Docs](frontend/README.md)
- [Backend Docs](backend/README.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Next.js Docs](https://nextjs.org/docs)

## 🎓 Model Details

- **Architecture**: MobileNetV2 (pretrained)
- **Classes**: Fist, Thumb up, palm
- **Input Size**: 224×224 pixels
- **Model Size**: ~14 MB
- **Inference Time**: 30-50ms (CPU), 10-20ms (GPU)
- **Training Framework**: PyTorch
- **Normalization**: ImageNet (mean, std)

## 🔐 Security

- ✅ CORS properly configured
- ✅ Input validation on backend
- ✅ HTTPS enforced on Vercel
- ✅ No sensitive data in logs
- ✅ Production-ready error handling

## 📈 Performance

- **Frontend**: 60+ FPS webcam feed
- **Backend**: <50ms inference per image
- **Network**: Optimized payload compression
- **Deployment**: CDN-accelerated (Vercel)

## 🚀 Future Enhancements

- [ ] Multi-gesture library expansion
- [ ] Batch prediction API
- [ ] Export gesture recordings
- [ ] Analytics dashboard
- [ ] Model quantization for mobile
- [ ] Multi-hand detection
- [ ] Pose estimation
- [ ] Real-time statistics

## 📝 License

MIT License - See LICENSE file

## 👤 Author

Created with ❤️ for real-time machine learning

---

## 🎉 Ready to Deploy?

1. **Read** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. **Configure** environment variables
3. **Push** to GitHub
4. **Deploy** frontend to Vercel
5. **Deploy** backend to Railway/Render
6. **Connect** them together
7. **Test** your live app!

**Questions?** Check the README files in frontend/ and backend/ directories.
