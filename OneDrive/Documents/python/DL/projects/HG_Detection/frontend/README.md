# Frontend - Next.js 14

Modern, production-ready frontend for the hand gesture recognition app.

## Features

- 🎥 Real-time webcam feed with WebGL acceleration
- 🤖 Live gesture detection and confidence scores
- 📊 Probability distribution visualization
- 📈 Prediction history tracking
- ⚡ Optimized performance (60+ FPS)
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- ♿ Accessible components

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment to Vercel

1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variable `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy

## Component Structure

- `components/GestureDetector.tsx` - Main detection UI component
- `app/page.tsx` - Home page
- `app/layout.tsx` - Root layout
- `styles/globals.css` - Global styles with animations
