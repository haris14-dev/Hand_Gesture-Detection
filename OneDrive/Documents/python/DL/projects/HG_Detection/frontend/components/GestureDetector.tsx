'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Square, Play, AlertCircle, Zap } from 'lucide-react';
import axios from 'axios';

interface GestureResult {
  gesture: string;
  confidence: number;
  probabilities: {
    [key: string]: number;
  };
}

interface PredictionHistory {
  gesture: string;
  confidence: number;
  timestamp: Date;
}

const CLASSES = ['Fist', 'Thumb up', 'palm'];
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CONFIDENCE_THRESHOLD = 0.6;

export default function GestureDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [gesture, setGesture] = useState<GestureResult | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [fps, setFps] = useState(0);
  const fpsRef = useRef(0);
  const timestampRef = useRef(Date.now());
  const [history, setHistory] = useState<PredictionHistory[]>([]);

  // Initialize webcam
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setCameraReady(true);
          setError('');
        }
      } catch (err) {
        setError('Unable to access camera. Please check permissions.');
        console.error('Camera error:', err);
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Main prediction loop
  useEffect(() => {
    if (!isRunning || !videoRef.current || !canvasRef.current || !cameraReady) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    if (!ctx) return;

    let isProcessing = false;

    const predict = () => {
      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Calculate FPS
      fpsRef.current++;
      const now = Date.now();
      if (now - timestampRef.current >= 1000) {
        setFps(fpsRef.current);
        fpsRef.current = 0;
        timestampRef.current = now;
      }

      // Send prediction asynchronously without blocking the loop
      if (!isProcessing) {
        isProcessing = true;
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              isProcessing = false;
              return;
            }

            const formData = new FormData();
            formData.append('file', blob, 'frame.png');

            try {
              const response = await axios.post<GestureResult>(
                `${API_URL}/predict`,
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                  timeout: 5000,
                }
              );

              setGesture(response.data);

              // Add to history
              if (response.data.confidence >= CONFIDENCE_THRESHOLD) {
                setHistory((prev) => [
                  {
                    gesture: response.data.gesture,
                    confidence: response.data.confidence,
                    timestamp: new Date(),
                  },
                  ...prev.slice(0, 9),
                ]);
              }

              setError('');
            } catch (err) {
              console.error('Prediction error:', err);
              setError('API connection error. Check backend.');
            } finally {
              isProcessing = false;
            }
          },
          'image/png'
        );
      }

      animationRef.current = requestAnimationFrame(predict);
    };

    animationRef.current = requestAnimationFrame(predict);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, cameraReady]);

  const togglePrediction = () => {
    setIsRunning(!isRunning);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20 border-green-500/50';
    if (confidence >= 0.6) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-0 animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-indigo-400" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
              Gesture Engine
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Real-time Hand Gesture Recognition</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
              {/* Video */}
              <video
                ref={videoRef}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    canvasRef.current!.width = videoRef.current.videoWidth;
                    canvasRef.current!.height = videoRef.current.videoHeight;
                  }
                }}
                className="w-full aspect-video object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Canvas for processing (hidden) */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay indicators */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top-left: Recording indicator */}
                {isRunning && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 px-3 py-2 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">LIVE</span>
                  </div>
                )}

                {/* Top-right: FPS counter */}
                {isRunning && (
                  <div className="absolute top-4 right-4 bg-slate-900/80 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-700/50">
                    <span className="text-xs text-slate-300 font-mono">{fps} FPS</span>
                  </div>
                )}
              </div>

              {/* Camera disabled state */}
              {!cameraReady && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Camera className="w-16 h-16 text-slate-500" />
                  <p className="text-slate-400 text-lg">Camera initializing...</p>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex gap-4">
              <button
                onClick={togglePrediction}
                disabled={!cameraReady}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : cameraReady
                    ? 'bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isRunning ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Detection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Current prediction */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Current Prediction</h3>

              {gesture && isRunning ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-2 ${getConfidenceBgColor(gesture.confidence)}`}>
                    <div className="text-slate-300 text-sm mb-1">Detected Gesture</div>
                    <div className={`text-3xl font-bold ${getConfidenceColor(gesture.confidence)}`}>
                      {gesture.gesture}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {CLASSES.map((cls) => {
                      const conf = gesture.probabilities[cls] || 0;
                      return (
                        <div key={cls} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">{cls}</span>
                            <span className={`font-semibold ${cls === gesture.gesture ? getConfidenceColor(conf) : 'text-slate-400'}`}>
                              {(conf * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-200 ${
                                cls === gesture.gesture ? 'bg-gradient-to-r from-indigo-500 to-pink-500' : 'bg-slate-600'
                              }`}
                              style={{ width: `${conf * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Confidence</div>
                    <div className={`text-2xl font-bold ${getConfidenceColor(gesture.confidence)}`}>
                      {(gesture.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 mx-auto mb-3"></div>
                  <p className="text-slate-400 text-sm">
                    {isRunning ? 'Waiting for gesture...' : 'Start detection to begin'}
                  </p>
                </div>
              )}
            </div>

            {/* Prediction history */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Recent History</h3>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <span className="font-medium text-slate-300">{item.gesture}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{(item.confidence * 100).toFixed(0)}%</span>
                        <span className="text-slate-500 text-xs">{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 py-4 text-sm">No predictions yet</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">System</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera</span>
                  <span className={cameraReady ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                    {cameraReady ? 'Ready' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={isRunning ? 'text-green-400 font-semibold' : 'text-slate-400 font-semibold'}>
                    {isRunning ? 'Running' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FPS</span>
                  <span className="text-indigo-400 font-semibold">{fps}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
          <p>🚀 Powered by TensorFlow & Next.js • Real-time Hand Gesture Recognition v1.0</p>
        </div>
      </div>
    </div>
  );
}
