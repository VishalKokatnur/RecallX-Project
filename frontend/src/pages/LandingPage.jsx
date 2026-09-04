import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="flex justify-between items-center p-6 max-w-5xl mx-auto">
        <span className="text-xl font-semibold">RecallX</span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm border rounded-md">
            Log in
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm bg-black text-white rounded-md">
            Register
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto text-center px-6 pt-20 pb-16">
        <h1 className="text-4xl font-semibold mb-4">
          Stop asking "what was the file name?"
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          RecallX finds your saved screenshots, PDFs, and notes by what they mean —
          not what they're called. Search your personal knowledge in plain English.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/register" className="px-6 py-3 bg-black text-white rounded-md">
            Get started
          </Link>
          <Link to="/login" className="px-6 py-3 border rounded-md">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6">
          <h3 className="font-medium mb-2">Upload anything</h3>
          <p className="text-sm text-gray-500">
            Screenshots, PDFs, Word docs, notes — RecallX reads them all automatically,
            including text inside images via OCR.
          </p>
        </div>
        <div className="border rounded-xl p-6">
          <h3 className="font-medium mb-2">Search by meaning</h3>
          <p className="text-sm text-gray-500">
            "Find that Docker deployment guide I saved" — no need to remember exact
            keywords or file names.
          </p>
        </div>
        <div className="border rounded-xl p-6">
          <h3 className="font-medium mb-2">Your data, private</h3>
          <p className="text-sm text-gray-500">
            Every file and search is scoped to your account. No one else can see
            what you've saved.
          </p>
        </div>
      </section>
    </div>
  );
}