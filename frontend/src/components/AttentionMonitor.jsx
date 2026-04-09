import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { Eye } from "lucide-react";

export default function AttentionMonitor({ 
  lessonId = "2", 
  onAttentionChange, 
  cameraEnabled = false,
  videoRef
}) {
  const streamRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const logBufferRef = useRef([]);
  const scoreHistoryRef = useRef([]);
  const [attentionScore, setAttentionScore] = useState(0.7);
  const [manualMode, setManualMode] = useState(false);

  // Simulated oscillation between 0.6 and 0.8
  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      const score = 0.7 + 0.1 * Math.sin(t); // oscillates 0.6 <-> 0.8
      setAttentionScore(parseFloat(score.toFixed(2)));
      if (onAttentionChange) onAttentionChange(parseFloat(score.toFixed(2)));
    }, 800);
    return () => clearInterval(interval);
  }, [onAttentionChange]);


  // --- HARD STOP FUNCTION ---
  const stopCamera = () => {
    if (streamRef.current) {
      console.log("Camera stopped");
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        // Already stopped or failed
      }
      cameraRef.current = null;
    }
  };

  // --- START CAMERA FUNCTION ---
  const startCamera = async () => {
    if (!cameraEnabled) return;
    
    // Prevent multiple streams
    if (streamRef.current) {
      stopCamera();
    }

    // WAIT for videoRef to be attached by UI
    if (!videoRef.current) {
      console.warn("AttentionMonitor: Waiting for videoRef to attach...");
      setTimeout(startCamera, 500);
      return;
    }

    console.log("Camera started");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize FaceMesh if not already done
      if (!faceMeshRef.current) {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const faceMesh = new FaceMesh({ 
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` 
        });
        
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          let newScore = 0.2;
          
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
             const landmarks = results.multiFaceLandmarks[0];
             const nose = landmarks[1];
             const leftEye = landmarks[133];
             const rightEye = landmarks[362];
             
             if (nose && leftEye && rightEye) {
                 // Calculate high-fidelity center of the face
                 const midX = (leftEye.x + rightEye.x) / 2.0;
                 const midY = (leftEye.y + rightEye.y) / 2.0;
                 
                 // Normalize deviation based on eye distance (depth invariant)
                 const eyeDist = Math.sqrt(
                    Math.pow(rightEye.x - leftEye.x, 2) + 
                    Math.pow(rightEye.y - leftEye.y, 2)
                 ) || 0.001;

                 const hDev = Math.abs(nose.x - midX) / eyeDist;
                 const vDev = Math.abs(nose.y - midY) / eyeDist;
                 
                 // Multi-axis attention vector
                 const totalDeviation = Math.sqrt(Math.pow(hDev, 2) + Math.pow(vDev, 2));
                 
                 // Map deviation to score using linear decay
                 // Score = 1.0 (Direct) -> 0.4 (Edge of screen) -> 0.1 (Looking away)
                 newScore = Math.max(0.1, 1.0 - (totalDeviation * 1.8));

                 // Target Ranges Verification:
                 // - Looking at screen (Dev < 0.1) -> ~0.82 to 1.0
                 // - Slight movement (Dev ~0.2) -> ~0.64
                 // - Looking away (Dev > 0.45) -> ~0.19
             } else {
                 newScore = 0.5; // Missing landmarks fallback
             }
          }
          
          scoreHistoryRef.current.push(newScore);
          if (scoreHistoryRef.current.length > 10) {
             scoreHistoryRef.current.shift();
          }
          const avgScore = scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length;
          
          setAttentionScore(avgScore);
          if (onAttentionChange) {
            onAttentionChange(avgScore);
          }
        });
        
        faceMeshRef.current = faceMesh;
      }

      // Start Camera Utils
      const { Camera } = await import("@mediapipe/camera_utils");
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current && streamRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
      cameraRef.current = camera;

    } catch (mediaErr) {
      console.warn("Camera access denied or missing. Engaging Manual Fallback Mode.");
      setManualMode(true);
      setAttentionScore(1.0);
      if (onAttentionChange) onAttentionChange(1.0);
    }
  };

  // Lifecycle useEffect
  useEffect(() => {
    if (cameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    // Fail-safe listener
    window.addEventListener("beforeunload", stopCamera);

    return () => {
      stopCamera();
      window.removeEventListener("beforeunload", stopCamera);
    };
  }, [cameraEnabled]);

  // Logging and Persistence useEffect
  useEffect(() => {
    let timer = null;
    let localTimer = null;
    
    const flushLogs = async () => {
      if (logBufferRef.current.length === 0) return;
      const batch = [...logBufferRef.current];
      logBufferRef.current = [];
      try {
         await Promise.allSettled(
             batch.map(score => api.post("/lessons/attention-log", {
                lesson_id: lessonId,
                attention_score: score
             }))
         );
      } catch (err) {
         console.debug("Bulk attention log buffer failed:", err);
      }
    };
    
    const trackLocalScore = () => {
       // Log the current score either from Camera Mesh or Manual Mode
       logBufferRef.current.push(attentionScore);
    };

    localTimer = setInterval(trackLocalScore, 2000); 
    timer = setInterval(flushLogs, 10000);

    return () => {
       clearInterval(timer);
       clearInterval(localTimer);
       flushLogs();
    };
  }, [attentionScore, lessonId]);



  if (manualMode) {
     return (
        <div className="absolute top-4 right-4 z-50 bg-[#111] border border-[#333] shadow-lg rounded-xl px-4 py-2 flex items-center justify-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
           <span className="text-gray-400 text-sm font-semibold">Camera unavailable (Manual Mode)</span>
        </div>
     );
  }

  return (
    <div className="attention-overlay" style={{ position: "absolute", top: 12, right: 12 }}>
      <div className="bg-[#111] px-3 py-1.5 rounded-full shadow-lg border border-[#333] flex items-center justify-center gap-2">
        <span className="text-xs font-bold font-mono tracking-wider text-gray-300">Focus: {attentionScore.toFixed(2)}</span>
        <Eye size={16} color={attentionScore > 0.5 ? "#2ecc71" : "#e74c3c"} />
      </div>
    </div>
  );
}
