import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BlockMath } from "react-katex";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "./LessonPlayer.css";
import AttentionMonitor from "./AttentionMonitor";

const TEMP_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwiZXhwIjoxNzcxNTc0MTEwfQ.rJ8meMYkJiROF1w0cVeATsUEpw6Kn5KirmBwTTjPNj8";

export default function LessonPlayer() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get("http://localhost:8000/lessons/2/generate", {
        headers: {
          Authorization: `Bearer ${TEMP_TOKEN}`,
        },
      });
      if (resp && resp.data && Array.isArray(resp.data.slides)) {
        setSlides(resp.data.slides);
        setCurrentIndex(0);
      } else {
        setError("Unexpected response shape from server");
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, slides.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  if (loading) return <div className="lesson-player">Loading slides…</div>;
  if (error)
    return (
      <div className="lesson-player error">
        <div>Failed to load slides:</div>
        <pre>{String(error)}</pre>
        <button onClick={fetchSlides}>Retry</button>
      </div>
    );

  if (!slides || slides.length === 0)
    return (
      <div className="lesson-player empty">
        No slides found. Try running ingestion or check the server.
      </div>
    );

  const slide = slides[currentIndex];

  return (
    <div className="lesson-player" style={{ position: "relative" }}>
      <AttentionMonitor lessonId={"2"} />
      <div className="lesson-header">
        <h2>{slide.title || `Slide ${currentIndex + 1}`}</h2>
        <div className="pager">
          {currentIndex + 1}/{slides.length}
        </div>
      </div>

      <div className="lesson-body">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="slide-card"
          >
            <div className="slide-content">
              <ul className="slide-bullets">
                {Array.isArray(slide.bullets) && slide.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
              </ul>

              {slide.formula ? (
                <div className="slide-formula">
                  <BlockMath>{slide.formula}</BlockMath>
                </div>
              ) : null}

              {slide.narration ? <p className="slide-narration">{slide.narration}</p> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="lesson-controls">
        <button onClick={goPrev} disabled={currentIndex === 0} aria-label="Previous slide">
          <ArrowLeft size={18} /> Prev
        </button>
        <button onClick={goNext} disabled={currentIndex >= slides.length - 1} aria-label="Next slide">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
