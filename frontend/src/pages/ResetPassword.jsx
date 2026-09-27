import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../services/authService.js";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset({ uid, token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.new_password?.[0] ||
        "This reset link is invalid or has expired.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
        <p className="text-green-700 text-center">
          Password reset successfully. Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-8">Set a new password</h1>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <label className="block text-sm text-muted mb-1">New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-line rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-ink transition-colors"
        />

        <label className="block text-sm text-muted mb-1">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border border-line rounded-lg px-3 py-2 mb-6 focus:outline-none focus:border-ink transition-colors"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper rounded-lg py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>

        <p className="text-sm text-muted text-center mt-6">
          <Link to="/login" className="text-ink underline underline-offset-2">Back to login</Link>
        </p>
      </form>
    </div>
  );
}