import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

// NOTE: requires installation of @mediapipe/face_mesh and @mediapipe/camera_utils
// npm install @mediapipe/face_mesh @mediapipe/camera_utils

const TEMP_TOKEN = "your_actual_token_here";

export default function AttentionMonitor({ lessonId = "2", intervalMs = 10000 }) {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const [attentionScore, setAttentionScore] = useState(0.0);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const { Camera } = await import("@mediapipe/camera_utils");

        const video = document.createElement("video");
        video.style.display = "none";
        video.autoplay = true;
        video.playsInline = true;
        videoRef.current = video;
        document.body.appendChild(video);

        const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          if (!mounted) return;
          const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
          // Simple heuristic: face present => focused; absent => not focused
          const score = hasFace ? 1.0 : 0.0;
          setAttentionScore(score);
        });

        const camera = new Camera(video, {
          onFrame: async () => {
            await faceMesh.send({ image: video });
          },
          width: 640,
          height: 480,
        });

        camera.start();
        cameraRef.current = camera;
        faceMeshRef.current = faceMesh;
      } catch (err) {
        console.warn("MediaPipe init failed:", err);
      }
    }

    init();

    return () => {
      mounted = false;
      try {
        if (cameraRef.current && cameraRef.current.stop) cameraRef.current.stop();
      } catch (e) {}
      try {
        if (videoRef.current && videoRef.current.parentNode) videoRef.current.parentNode.removeChild(videoRef.current);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    let timer = null;
    async function send() {
      try {
        await axios.post(
          "http://localhost:8000/lessons/attention-log",
          { lesson_id: lessonId, attention_score: attentionScore },
          { headers: { Authorization: `Bearer ${TEMP_TOKEN}` } }
        );
      } catch (err) {
        // swallow network errors for now
        console.debug("Attention log send failed:", err?.message || err);
      }
    }

    // send immediately then on interval
    send();
    timer = setInterval(send, intervalMs);

    return () => clearInterval(timer);
  }, [attentionScore, lessonId, intervalMs]);

  return (
    <div className="attention-overlay" style={{ position: "absolute", top: 12, right: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Eye color={attentionScore > 0.5 ? "#2ecc71" : "#e74c3c"} />
      </div>
    </div>
  );
}
