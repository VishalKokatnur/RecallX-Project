import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService.js";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register(form);
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Registration failed");
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
            Your personal archive, one upload away.
          </p>
          <p className="text-paper/60 text-sm max-w-xs">
            Every file you save becomes searchable by meaning, automatically.
          </p>
        </div>
        <p className="text-paper/40 text-xs">&copy; RecallX</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-paper">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-2xl mb-8">Create your account</h1>

          {error && <p className="text-danger text-sm mb-4 break-words">{error}</p>}

          <label className="block text-sm text-muted mb-1">Username</label>
          <input
            name="username"
            placeholder="you@example.com"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full border border-line rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-ink transition-colors"
          />

          <label className="block text-sm text-muted mb-1">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-line rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-ink transition-colors"
          />

          <label className="block text-sm text-muted mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full border border-line rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-ink transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-sm text-muted text-center mt-6">
            Already have an account? <Link to="/login" className="text-ink underline underline-offset-2">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}