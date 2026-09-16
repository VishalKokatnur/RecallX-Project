import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Upload anything",
    body: "Screenshots, PDFs, Word docs, notes — RecallX reads them all automatically, including text inside images via OCR.",
  },
  {
    title: "Search by meaning",
    body: "\u201cFind that Docker deployment guide I saved\u201d — no need to remember exact keywords or file names.",
  },
  {
    title: "Your data, private",
    body: "Every file and search is scoped to your account. No one else can see what you've saved.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="flex justify-between items-center px-6 py-6 max-w-5xl mx-auto">
        <span className="font-display text-lg font-semibold">RecallX</span>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm text-muted hover:text-ink transition-colors">
            Log in
          </Link>
          <Link to="/register" className="text-sm px-4 py-2 bg-ink text-paper rounded-lg hover:bg-ink/90 transition-colors">
            Register
          </Link>
        </div>
      </nav>

      <section className="max-w-2xl mx-auto px-6 pt-20 pb-20">
        <h1 className="font-display text-5xl leading-[1.1] mb-6">
          Stop asking what the file was called.
        </h1>
        <p className="text-lg text-muted mb-9 max-w-lg">
          RecallX finds your saved screenshots, PDFs, and notes by what they mean,
          not what they're named. Search your personal knowledge in plain English.
        </p>
        <div className="flex gap-3">
          <Link to="/register" className="px-6 py-3 bg-ink text-paper rounded-lg hover:bg-ink/90 transition-colors">
            Get started
          </Link>
          <Link to="/login" className="px-6 py-3 border border-line rounded-lg hover:border-ink transition-colors">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 border-t border-line">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`py-8 px-2 md:px-6 ${i > 0 ? "md:border-l border-line" : ""}`}
            >
              <h3 className="font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}