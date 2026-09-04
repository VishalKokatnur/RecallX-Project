import { useState } from "react";
import searchService from "../services/searchService.js";

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAsked(true);
    try {
      const data = await searchService.askAssistant(question);
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      setAnswer("Something went wrong asking the assistant. Try again.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Ask RecallX</h1>
      <p className="text-gray-500 mb-6">
        Ask a question and RecallX will summarize what it knows from your saved files.
      </p>

      <form onSubmit={handleAsk} className="flex gap-2 mb-8">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='e.g. "What do I already know about Docker?"'
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-md px-5 py-2 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {asked && !loading && (
        <div className="border rounded-lg p-5 bg-gray-50 whitespace-pre-line text-sm leading-relaxed mb-6">
          {answer}
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h2>
          <ul className="space-y-2">
            {sources.map((s) => (
              <li key={s.file_id} className="border rounded-md p-3 flex justify-between text-sm">
                <span className="truncate">{s.file_name}</span>
                <span className="text-gray-400 text-xs shrink-0 ml-2">{(s.score * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}