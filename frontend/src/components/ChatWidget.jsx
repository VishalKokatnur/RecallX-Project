// import { useState, useRef, useEffect } from "react";
// import searchService from "../services/searchService.js";
// import { openFile, downloadFile } from "../utils/openFile.js";
// function RobotIcon({ size = 16 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
//       <line x1="2.5" y1="10" x2="2.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//       <line x1="21.5" y1="10" x2="21.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//       <path d="M12 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//       <circle cx="12" cy="2" r="1" fill="currentColor" />
//       <rect x="5" y="6" width="14" height="13" rx="4" stroke="currentColor" strokeWidth="1.5" />
//       <circle cx="9.5" cy="12.5" r="1.3" fill="currentColor" />
//       <circle cx="14.5" cy="12.5" r="1.3" fill="currentColor" />
//       <path d="M9 15.5c1 1 5 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//     </svg>
//   );
// }

// function Avatar({ size = 36, iconSize }) {
//   return (
//     <div
//       className="shrink-0 rounded-full bg-black text-white flex items-center justify-center"
//       style={{ width: size, height: size }}
//     >
//       <RobotIcon size={iconSize ?? Math.round(size * 0.55)} />
//     </div>
//   );
// }

// function CloseIcon({ size = 16 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
//       <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//     </svg>
//   );
// }

// function SendIcon() {
//   return (
//     <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//       <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }

// export default function ChatWidget() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { role: "ai", text: "Hi! How can I help you? Ask me about anything you've saved." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showHint, setShowHint] = useState(() => {
//     try {
//       return !localStorage.getItem("recallx_chat_hint_dismissed");
//     } catch {
//       return true;
//     }
//   });
//   const bottomRef = useRef(null);
//   const inputRef = useRef(null);

//   const dismissHint = () => {
//     setShowHint(false);
//     try {
//       localStorage.setItem("recallx_chat_hint_dismissed", "1");
//     } catch {}
//   };

//   useEffect(() => {
//     if (!showHint) return;
//     const timer = setTimeout(dismissHint, 8000);
//     return () => clearTimeout(timer);
//   }, [showHint]);

//   useEffect(() => {
//     if (open) {
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//       inputRef.current?.focus();
//     }
//   }, [messages, loading, open]);

//   const SMALL_TALK = {
//     "thank you": "You're welcome! Let me know if there's anything else you'd like to find.",
//     "thanks": "Anytime! Happy to help you find what you're looking for.",
//     "thank you so much": "You're so welcome! Come back anytime you need to find something.",
//     "ok": "Great! Let me know if you need anything else.",
//     "okay": "Great! Let me know if you need anything else.",
//     "bye": "Bye! Come back anytime you need to remember something.",
//     "hi": "Hi there! What are you trying to find today?",
//     "hello": "Hello! What are you trying to remember?",
//     "hey": "Hey! What can I help you dig up today?",
//     "good": "Glad to hear it! Anything else I can help you find?",
//     "cool": "Glad that helped! Let me know what else you need.",
//     "nice": "Glad you liked it! Anything else you're looking for?",
//     "good morning": "Hey very good morning, how can i help you",
//     "good afternoon": "Hey very good afternoon, how can i help you",
//     "good evening": "Hey very good evening, how can i help you",
//     "good night": "Hey good night, see you later",
//     "hey good morning": "Hey very good morning, how can i help you",
//     "hey good afternoon": "Hey very good afternoon, how can i help you",
//     "hey good evening": "Hey very good evening, how can i help you",
//     "hey good night": "Hey good night, see you later",
//     "how are you":"Yeah i am pretty good thank you",

//   };

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const question = input.trim();
//     if (!question) return;

//     setMessages((prev) => [...prev, { role: "user", text: question }]);
//     setInput("");

//     const normalized = question.toLowerCase().replace(/[.,!?]/g, "").trim();
//     if (SMALL_TALK[normalized]) {
//       setMessages((prev) => [...prev, { role: "ai", text: SMALL_TALK[normalized] }]);
//       return;
//     }

//     setLoading(true);

//     try {
//       const data = await searchService.askAssistant(question);
//       const sources = data.sources || [];

//       let introText;
//       if (sources.length === 0) {
//         introText = "Sorry, I couldn't find anything related to that in your saved files.";
//       } else {
//         introText = `Sure, let me check... yes! I found ${sources.length} file${sources.length !== 1 ? "s" : ""} related to that. Take a look:`;
//       }

//       setMessages((prev) => [...prev, { role: "ai", text: introText, sources }]);
//     } catch (err) {
//       setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong, please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
//       <div
//         className={`mb-3 w-[360px] h-[500px] bg-white border border-gray-200 rounded-[20px] shadow-2xl flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ease-out ${
//           open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
//         }`}
//       >
//         <div className="bg-black text-white px-4 py-3 flex items-center gap-3">
//           <Avatar size={30} />
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium leading-tight">RecallX Assistant</p>
//             <p className="text-[11px] text-gray-400 leading-tight">Ask about anything you've saved</p>
//           </div>
//           <button
//             onClick={() => setOpen(false)}
//             className="text-gray-400 hover:text-white transition-colors p-1"
//             aria-label="Close chat"
//           >
//             <CloseIcon />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-3 space-y-3">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-2 animate-fade-in-up ${m.role === "user" ? "justify-end" : "justify-start"}`}>
//               {m.role === "ai" && <Avatar size={24} />}
//               <div
//                 className={`max-w-[78%] px-3 py-2 text-[13px] leading-relaxed ${
//                   m.role === "user"
//                     ? "bg-black text-white rounded-2xl rounded-br-sm"
//                     : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
//                 }`}
//               >
//                 <p>{m.text}</p>

//                 {m.sources && m.sources.length > 0 && (
//                   <div className="mt-2 space-y-1.5">
//                     {m.sources.map((s) => (
//                       <div
//                         key={s.file_id}
//                         className="bg-white border border-gray-200 rounded-xl p-2 hover:border-gray-300 transition-colors"
//                       >
//                         <p className="font-medium truncate text-gray-900">{s.file_name}</p>
//                         <p className="text-[10px] text-gray-400 mb-1">
//                           {s.file_type} - {(s.score * 100).toFixed(0)}% match
//                         </p>
//                         {s.file_url && (
//                           <div className="flex gap-3">
//                             <button onClick={() => openFile(s.file_url)} className="text-blue-600 hover:underline text-[11px]">
//                               View
//                             </button>
//                             <button onClick={() => downloadFile(s.file_url, s.file_name)} className="text-blue-600 hover:underline text-[11px]">
//                               Download
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="flex gap-2 justify-start animate-fade-in-up">
//               <Avatar size={24} />
//               <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">
//                 {[0, 1, 2].map((i) => (
//                   <span
//                     key={i}
//                     className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
//                     style={{ animationDelay: `${i * 120}ms` }}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//           <div ref={bottomRef} />
//         </div>

//         <form onSubmit={handleSend} className="p-2.5 border-t border-gray-100 flex gap-2">
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 border border-gray-200 rounded-full px-3.5 py-2 text-[13px] focus:outline-none focus:border-gray-400 transition-colors"
//           />
//           <button
//             type="submit"
//             disabled={loading || !input.trim()}
//             className="w-9 h-9 shrink-0 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-900 active:scale-95 transition-all"
//             aria-label="Send message"
//           >
//             <SendIcon />
//           </button>
//         </form>
//       </div>

//       {showHint && !open && (
//         <div className="mb-3 flex items-center gap-1.5 justify-end animate-fade-in-up">
//           <button
//             onClick={() => {
//               setOpen(true);
//               dismissHint();
//             }}
//             className="bg-white border border-gray-200 rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-lg text-[13px] text-gray-800 hover:border-gray-300 transition-colors text-left max-w-[220px]"
//           >
//             Looking for something? Ask me — I can search everything you've saved.
//           </button>
//           <button
//             onClick={dismissHint}
//             className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
//             aria-label="Dismiss"
//           >
//             <CloseIcon size={14} />
//           </button>
//         </div>
//       )}

//       <div className="relative">
//         {showHint && !open && (
//           <span className="absolute inset-0 rounded-full bg-black opacity-20 animate-ping pointer-events-none" />
//         )}
//         <button
//           onClick={() => {
//             setOpen((o) => !o);
//             dismissHint();
//           }}
//           className="relative w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-900 active:scale-95 transition-all"
//           aria-label={open ? "Close chat" : "Open chat"}
//         >
//           {open ? <CloseIcon size={20} /> : <RobotIcon size={26} />}
//         </button>
//       </div>
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import searchService from "../services/searchService.js";
import { openFile, downloadFile } from "../utils/openFile.js";

function RobotIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="2.5" y1="10" x2="2.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="21.5" y1="10" x2="21.5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <rect x="5" y="6" width="14" height="13" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9.5" cy="12.5" r="1.3" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1.3" fill="currentColor" />
      <path d="M9 15.5c1 1 5 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Avatar({ size = 36, iconSize }) {
  return (
    <div
      className="shrink-0 rounded-full bg-black text-white flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <RobotIcon size={iconSize ?? Math.round(size * 0.55)} />
    </div>
  );
}

function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! How can I help you? Ask me about anything you've saved.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [showHint, setShowHint] = useState(() => {
    try {
      return !localStorage.getItem("recallx_chat_hint_dismissed");
    } catch {
      return true;
    }
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const dismissHint = () => {
    setShowHint(false);

    try {
      localStorage.setItem("recallx_chat_hint_dismissed", "1");
    } catch {}
  };

  useEffect(() => {
    if (!showHint) return;

    const timer = setTimeout(dismissHint, 8000);

    return () => clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, loading, open]);

  /*
  ============================================================
  SMALL TALK
  ============================================================
  */

  const SMALL_TALK = {
    /* =========================
       GREETINGS
    ========================= */

    "hi":
      "Hello! 👋 How can I help you today?",

    "hello":
      "Hello! 👋 What would you like to know?",

    "hey":
      "Hey! 👋 How can I help you?",

    "hii":
      "Hii! 👋 Nice to see you. How can I help?",

    "hiii":
      "Hey! 😊 How can I help you today?",

    "hey there":
      "Hey there! 👋 What can I help you with?",

    "hello there":
      "Hello there! 😊 How can I help?",

    "good morning":
      "Good morning! ☀️ How can I help you today?",

    "good afternoon":
      "Good afternoon! 😊 What can I help you with?",

    "good evening":
      "Good evening! 🌙 How can I help you today?",

    "good night":
      "Good night! 🌙 Take care and see you later!",

    "hey good morning":
      "Good morning! ☀️ Hope you're having a great day. How can I help?",

    "hey good afternoon":
      "Good afternoon! 😊 What would you like to do?",

    "hey good evening":
      "Good evening! 🌙 How can I help you?",

    "hey good night":
      "Good night! 🌙 See you later!",


    /* =========================
       HOW ARE YOU
    ========================= */

    "how are you":
      "I'm doing great! 🤖 Thanks for asking. How can I help you?",

    "how are you doing":
      "I'm doing pretty well! 😊 What can I help you with?",

    "how are you today":
      "I'm doing great today! 🤖 Ready to help you.",

    "are you okay":
      "Yes! 😊 I'm ready whenever you need me.",

    "are you good":
      "I'm doing great! 👍 What can I help you with?",

    "how is it going":
      "It's going great! 😄 What would you like to do?",


    /* =========================
       THANK YOU
    ========================= */

    "thank you":
      "You're very welcome! 😊 Let me know if you need anything else.",

    "thanks":
      "Anytime! 😄 Happy to help.",

    "thank you so much":
      "You're very welcome! 😊 I'm glad I could help.",

    "thanks a lot":
      "You're welcome! 🙌 Happy to help.",

    "thanks buddy":
      "Anytime! 😄",

    "thank you buddy":
      "You're welcome! 😊",

    "thank you very much":
      "You're very welcome! I'm always happy to help.",


    /* =========================
       OK / CONFIRMATION
    ========================= */

    "ok":
      "Okay! 👍 Let me know if you need anything else.",

    "okay":
      "Sure! 👍",

    "okay thanks":
      "You're welcome! 😊",

    "ok thanks":
      "Anytime! 👍",

    "alright":
      "Alright! 👍",

    "all right":
      "Alright! What would you like to do next?",

    "got it":
      "Great! 👍",

    "understood":
      "Perfect! 😊",

    "sure":
      "Sure! 👍 How can I help?",

    "yes":
      "Great! 👍 What would you like to do?",

    "no":
      "No problem! 😊",


    /* =========================
       GOOD / NICE / COOL
    ========================= */

    "good":
      "Glad to hear that! 😊 Is there anything else I can help you with?",

    "great":
      "Awesome! 😄 What can I help you with next?",

    "awesome":
      "That's great! 🚀 What would you like to do next?",

    "cool":
      "Glad you liked it! 😄",

    "nice":
      "Glad you liked it! 😊 What else can I help you with?",

    "perfect":
      "Perfect! 👍 Let me know what you'd like to do next.",

    "excellent":
      "Awesome! 🎉 What can I help you with next?",


    /* =========================
       BYE / EXIT
    ========================= */

    "bye":
      "Goodbye! 👋 Come back anytime you need help.",

    "goodbye":
      "Goodbye! 👋 Have a great day!",

    "see you":
      "See you later! 👋",

    "see you later":
      "See you later! 😊 Take care!",

    "talk to you later":
      "Sure! 👋 Talk to you later.",

    "take care":
      "You too! 😊 Take care.",


    /* =========================
       WHAT CAN YOU DO
    ========================= */

    "what can you do":
      "I can help you search your saved files, find documents, understand information, and answer questions. 🤖",

    "what do you do":
      "I'm your RecallX AI assistant. I can help you find and understand information from your saved files. 🔎",

    "what are you":
      "I'm an AI assistant built into RecallX to help you search and work with your saved information. 🤖",

    "who are you":
      "I'm RecallX AI, your personal file-search assistant. I can help you find information from your saved files. 🔎",

    "what is recallx":
      "RecallX is an AI-powered file search system that helps you find files using natural-language and semantic search.",

    "tell me about yourself":
      "I'm RecallX AI 🤖. I can help you search your saved files and answer questions based on the information available to me.",


    /* =========================
       HELP
    ========================= */

    "help":
      "Of course! 😊 You can ask me to find a file, search your documents, or ask me a general question.",

    "i need help":
      "Sure! 😊 Tell me what you're looking for and I'll try to help.",

    "can you help me":
      "Absolutely! 🤖 Tell me what you need help with.",

    "help me":
      "Sure! What are you trying to find or understand?",


    /* =========================
       FILE SEARCH CONVERSATION
    ========================= */

    "find something":
      "Sure! 🔎 Tell me what you're looking for. You can describe the file by its name, topic, or content.",

    "i am looking for something":
      "Sure! 🔎 Tell me anything you remember about it and I'll try to find it.",

    "i need to find a file":
      "No problem! 🔎 Tell me what you remember about the file and I'll search for it.",

    "can you find my file":
      "Absolutely! 🔎 Tell me the file name or describe what's inside it.",

    "can you search my files":
      "Yes! 🔎 Tell me what you're looking for and I'll search your saved files.",

    "search my files":
      "Sure! 🔎 What would you like me to search for?",

    "find my documents":
      "Sure! 📄 Tell me what kind of document you're looking for.",


    /* =========================
       AI / TECHNOLOGY SMALL TALK
    ========================= */

    "are you an ai":
      "Yes! 🤖 I'm an AI assistant built into RecallX.",

    "are you real":
      "I'm an AI, so I'm not a person, but I'm here to help you. 🤖",

    "do you sleep":
      "Nope! 😄 I'm available whenever you need me.",

    "do you have feelings":
      "I don't experience feelings like humans do, but I can understand and respond to what you say.",

    "are you a robot":
      "I'm an AI assistant. 🤖 You can think of me as the assistant inside RecallX.",


    /* =========================
       CASUAL QUESTIONS
    ========================= */

    "what are you doing":
      "I'm right here and ready to help! 😄",

    "are you there":
      "Yes! 👋 I'm here. What do you need?",

    "hello are you there":
      "Yes! 😊 I'm here and ready to help.",

    "can you hear me":
      "I can read your messages! 👀 What would you like to ask?",

    "are you working":
      "Yes! 🤖 Everything is ready. What can I help you with?",


    /* =========================
       COMPLIMENTS
    ========================= */

    "you are good":
      "Thank you! 😊 I appreciate that.",

    "you are great":
      "Thank you! 🤖 I'm glad I could help.",

    "you are awesome":
      "Thanks! 😄 You're awesome too!",

    "good job":
      "Thank you! 😊 Glad I could help.",

    "well done":
      "Thank you! 🙌 Happy to help.",


    /* =========================
       FUN / CASUAL
    ========================= */

    "haha":
      "😄 Glad I could make you smile!",

    "lol":
      "😄",

    "nice one":
      "Thanks! 😄 What can I help you with next?",

    "interesting":
      "Absolutely! 😊 If you'd like, you can ask me more about it.",

    "really":
      "Yes! 😊 If you want, you can ask me for more details.",

    "wow":
      "😄 Pretty cool, right?",


    /* =========================
       IDENTITY
    ========================= */

    "my name is vishal":
      "Nice to meet you, Vishal! 👋 How can I help you today?",

    "i am vishal":
      "Nice to meet you, Vishal! 😊 What can I help you with?",


    /* =========================
       GENERAL CONVERSATION
    ========================= */

    "tell me something":
      "Sure! 😊 Here's something useful: RecallX can help you find information using the meaning of your query rather than only matching the exact filename.",

    "tell me something interesting":
      "Here's something interesting! 🧠 AI semantic search can understand the meaning of a query, so you can sometimes find a document even when you don't remember its exact name.",

    "i am bored":
      "Let's fix that! 😄 Ask me something, search for a file, or tell me what you're working on.",

    "i am back":
      "Welcome back! 👋 What would you like to do?",

    "im back":
      "Welcome back! 😊 Ready when you are.",


    "i love you":
      "hey sorry i love vishal. he is mine"

  };


  /*
  ============================================================
  HANDLE MESSAGE
  ============================================================
  */

  const handleSend = async (e) => {
    e.preventDefault();

    const question = input.trim();

    if (!question || loading) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: question,
      },
    ]);

    setInput("");

    /*
    ------------------------------------------------------------
    NORMALIZE USER MESSAGE
    ------------------------------------------------------------
    Handles:
    Hi!
    Hello!!!
    Thanks.
    Good morning!
    ------------------------------------------------------------
    */

    const normalized = question
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    /*
    ------------------------------------------------------------
    SMALL TALK CHECK
    ------------------------------------------------------------
    */

    if (SMALL_TALK[normalized]) {
      setLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: SMALL_TALK[normalized],
          },
        ]);

        setLoading(false);
      }, 400);

      return;
    }

    /*
    ============================================================
    NORMAL QUESTION → RECALLX SEARCH / AI
    ============================================================
    */

    setLoading(true);

    try {
      const data = await searchService.askAssistant(question);

      const sources = data.sources || [];

      let introText;

      if (sources.length === 0) {
        introText =
          "Sorry, I couldn't find anything related to that in your saved files.";
      } else {
        introText = `Sure, let me check... yes! I found ${
          sources.length
        } file${sources.length !== 1 ? "s" : ""} related to that. Take a look:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: introText,
          sources,
        },
      ]);
    } catch (err) {
      console.error("RecallX Assistant Error:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Something went wrong, please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
      {/* CHAT WINDOW */}
      <div
        className={`mb-3 w-[360px] h-[500px] bg-white border border-gray-200 rounded-[20px] shadow-2xl flex flex-col overflow-hidden origin-bottom-right transition-all duration-200 ease-out ${
  open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
}`}
      >

        {/* HEADER */}
        <div className="bg-black text-white px-4 py-3 flex items-center gap-3">
          <Avatar size={30} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">
              RecallX Assistant
            </p>

            <p className="text-[11px] text-gray-400 leading-tight">
              Ask about anything you've saved
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>


        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 animate-fade-in-up ${
                m.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              {m.role === "ai" && <Avatar size={24} />}

              <div
                className={`max-w-[78%] px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-black text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                }`}
              >

                <p>{m.text}</p>


                {/* SOURCES */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 space-y-1.5">

                    {m.sources.map((s) => (
                      <div
                        key={s.file_id}
                        className="bg-white border border-gray-200 rounded-xl p-2 hover:border-gray-300 transition-colors"
                      >

                        <p className="font-medium truncate text-gray-900">
                          {s.file_name}
                        </p>

                        <p className="text-[10px] text-gray-400 mb-1">
                          {s.file_type} -{" "}
                          {(s.score * 100).toFixed(0)}% match
                        </p>

                        {s.file_url && (
                          <div className="flex gap-3">

                            <button
                              onClick={() => openFile(s.file_url)}
                              className="text-blue-600 hover:underline text-[11px]"
                            >
                              View
                            </button>

                            <button
                              onClick={() =>
                                downloadFile(
                                  s.file_url,
                                  s.file_name
                                )
                              }
                              className="text-blue-600 hover:underline text-[11px]"
                            >
                              Download
                            </button>

                          </div>
                        )}

                      </div>
                    ))}

                  </div>
                )}

              </div>
            </div>
          ))}


          {/* TYPING INDICATOR */}
          {loading && (
            <div className="flex gap-2 justify-start animate-fade-in-up">

              <Avatar size={24} />

              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1">

                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}

              </div>

            </div>
          )}

          <div ref={bottomRef} />

        </div>


        {/* INPUT */}
        <form
          onSubmit={handleSend}
          className="p-2.5 border-t border-gray-100 flex gap-2"
        >

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-full px-3.5 py-2 text-[13px] focus:outline-none focus:border-gray-400 transition-colors"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-9 h-9 shrink-0 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-900 active:scale-95 transition-all"
            aria-label="Send message"
          >
            <SendIcon />
          </button>

        </form>

      </div>


      {/* HINT */}
      {showHint && !open && (
<div className="mb-3 flex items-center gap-1.5 justify-end animate-fade-in-up pointer-events-auto">
          <button
            onClick={() => {
              setOpen(true);
              dismissHint();
            }}
            className="bg-white border border-gray-200 rounded-2xl rounded-br-sm px-3.5 py-2.5 shadow-lg text-[13px] text-gray-800 hover:border-gray-300 transition-colors text-left max-w-[220px]"
          >
            Looking for something? Ask me — I can search everything
            you've saved.
          </button>

          <button
            onClick={dismissHint}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <CloseIcon size={14} />
          </button>

        </div>
      )}


      {/* CHAT BUTTON */}
<div className="relative pointer-events-auto">
        {showHint && !open && (
          <span className="absolute inset-0 rounded-full bg-black opacity-20 animate-ping pointer-events-none" />
        )}

        <button
          onClick={() => {
            setOpen((o) => !o);
            dismissHint();
          }}
          className="relative w-14 h-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-gray-900 active:scale-95 transition-all"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <CloseIcon size={20} />
          ) : (
            <RobotIcon size={26} />
          )}
        </button>

      </div>

    </div>
  );
}
