import { useState, useRef, useEffect } from "react";
import searchService from "../services/searchService.js";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! How can I help you? Ask me about anything you've saved." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

    const SMALL_TALK = {
    "thank you": "You're welcome! Let me know if there's anything else you'd like to find.",
    "thanks": "Anytime! Happy to help you find what you're looking for.",
    "thank you so much": "You're so welcome! Come back anytime you need to find something.",
    "ok": "Great! Let me know if you need anything else.",
    "okay": "Great! Let me know if you need anything else.",
    "bye": "Bye! Come back anytime you need to remember something.",
    "hi": "Hi there! What are you trying to find today?",
    "hello": "Hello! What are you trying to remember?",
    "hey": "Hey! What can I help you dig up today?",
    "good": "Glad to hear it! Anything else I can help you find?",
    "cool": "Glad that helped! Let me know what else you need.",
    "nice": "Glad you liked it! Anything else you're looking for?",
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    const normalized = question.toLowerCase().replace(/[.,!?]/g, "").trim();
    if (SMALL_TALK[normalized]) {
      setMessages((prev) => [...prev, { role: "ai", text: SMALL_TALK[normalized] }]);
      return;
    }

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
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-80 h-[28rem] bg-white border rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="bg-black text-white px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-medium">RecallX Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white text-lg leading-none">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    m.role === "user" ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{m.text}</p>

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {m.sources.map((s) => (
                        <div key={s.file_id} className="bg-white border rounded-lg p-2">
                          <p className="font-medium truncate">{s.file_name}</p>
                          <p className="text-[10px] text-gray-400 mb-1">{s.file_type} - {(s.score * 100).toFixed(0)}%</p>
                          {s.file_url && (
                            <div className="flex gap-2">
                              <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                              <a href={s.file_url} download className="text-blue-600 hover:underline">Download</a>
                            </div>
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
                <div className="bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500">Thinking...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white rounded-full px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-black text-white text-2xl shadow-lg flex items-center justify-center"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}