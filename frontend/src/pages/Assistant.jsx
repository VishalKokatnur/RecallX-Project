import { useState, useRef, useEffect } from "react";
import searchService from "../services/searchService.js";

export default function Assistant() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! How can I help you? Ask me about anything you've saved." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await searchService.askAssistant(question);
      const sources = data.sources || [];

      let introText;
      if (sources.length === 0) {
        introText = "Sorry, I couldn't find anything related to that in your saved files.";
      } else {
        introText = `Sure, let me check... yes! I found ${sources.length} file${sources.length !== 1 ? "s" : ""} related to that. Take a look:`;
      }

      setMessages((prev) => [...prev, { role: "ai", text: introText, sources }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong, please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Chat with RecallX</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p>{m.text}</p>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.sources.map((s) => (
                    <div key={s.file_id} className="bg-white border rounded-lg p-3">
                      <p className="font-medium text-sm truncate">{s.file_name}</p>
                      <p className="text-xs text-gray-400 mb-2">{s.file_type} - {(s.score * 100).toFixed(0)}% match</p>
                      {s.file_url ? (
                        <div className="flex gap-3">
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            View
                          </a>
                          <a href={s.file_url} download className="text-xs text-blue-600 hover:underline">
                            Download
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No file attached</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500">Thinking...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-full px-5 py-2 text-sm disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}