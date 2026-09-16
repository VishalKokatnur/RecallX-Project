import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-ink text-paper p-12">
        <Link to="/" className="font-display text-lg font-semibold">RecallX</Link>
        <div>
          <p className="font-display text-3xl leading-snug mb-4">
            Everything you've saved, findable by what it means.
          </p>
          <p className="text-paper/60 text-sm max-w-xs">
            Screenshots, PDFs, and notes — searchable in plain English.
          </p>
        </div>
        <p className="text-paper/40 text-xs">&copy; RecallX</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-paper">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-2xl mb-8">Log in to RecallX</h1>

          {error && <p className="text-danger text-sm mb-4">{error}</p>}

          <label className="block text-sm text-muted mb-1">Username</label>
          <input
            name="username"
            placeholder="you@example.com"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full border border-line rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-ink transition-colors"
          />

          <label className="block text-sm text-muted mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-line rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-ink transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-sm text-muted text-center mt-6">
            No account? <Link to="/register" className="text-ink underline underline-offset-2">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}