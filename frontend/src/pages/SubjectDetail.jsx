import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // For MVP, we will mock chapters since the backend API only handles /subjects/ currently.
  // In a real app, you would fetch GET /subjects/${id}/chapters
  const MOCK_CHAPTERS = [
    { id: "chapter_1", title: "Introduction to Polynomials", description: "Basic concepts and definitions of polynomials." },
    { id: "chapter_2", title: "Polynomials (RAG Context)", description: "Detailed look at zeros of polynomials and their geometric meaning." },
    { id: "chapter_3", title: "Division Algorithm", description: "Applying division algorithm for polynomials." }
  ];

  useEffect(() => {
    // Fetch subject details to show the correct title
    const fetchSubject = async () => {
      try {
        const res = await api.get(`/subjects/`);
        const found = res.data.find(s => s.id.toString() === id);
        if (found) {
          setSubject(found);
        } else {
          setSubject({ title: `Subject #${id}`, description: "Description not found." });
        }
      } catch (err) {
        setSubject({ title: `Subject #${id}`, description: "Could not load subject details." });
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors mb-8 group">
        <span className="mr-2 transform transition-transform group-hover:-translate-x-1">←</span> Back to Dashboard
      </Link>

      <div className="bg-gradient-to-r from-[#1c1c1c] to-[#252525] border border-[#333] rounded-2xl p-8 mb-10 shadow-lg">
        <h1 className="text-3xl font-extrabold text-white mb-2">{subject?.title}</h1>
        <p className="text-gray-400 text-lg">{subject?.description}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-200">Available Chapters</h2>
        <p className="text-sm text-gray-400 mt-1">Select a chapter to jump into the personalized lesson.</p>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_CHAPTERS.map((chapter, index) => (
          <div 
            key={chapter.id}
            onClick={() => navigate(`/lesson/${chapter.id}`)}
            className="group cursor-pointer flex items-center justify-between bg-[#181818] border border-[#2a2a2a] p-5 rounded-xl hover:bg-[#202020] hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center text-gray-500 font-bold group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-white transition-colors">{chapter.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{chapter.description}</p>
              </div>
            </div>
            
            <button className="bg-[#222] border border-[#333] text-gray-300 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
              Start Lesson
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
