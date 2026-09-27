import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await authService.requestPasswordReset(email);
      setMessage(data.detail || "If an account with that email exists, a reset link has been sent.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-2">Forgot your password?</h1>
        <p className="text-sm text-muted mb-8">
          Enter your email and we'll send you a link to reset it.
        </p>

        {message && <p className="text-green-700 text-sm mb-4">{message}</p>}
        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <label className="block text-sm text-muted mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-line rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-ink transition-colors"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-sm text-muted text-center mt-6">
          <Link to="/login" className="text-ink underline underline-offset-2">Back to login</Link>
        </p>
      </form>
    </div>
  );
}