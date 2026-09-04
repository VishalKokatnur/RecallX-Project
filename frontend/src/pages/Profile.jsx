import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.new_password !== form.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password/", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setMessage("Password changed successfully.");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="border rounded-md p-4 mb-8">
        <p className="text-sm text-gray-500">Username</p>
        <p className="font-medium mb-3">{user?.username}</p>
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{user?.email || "Not set"}</p>
      </div>

      <h2 className="text-lg font-medium mb-4">Change password</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="password"
          name="current_password"
          placeholder="Current password"
          value={form.current_password}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          name="new_password"
          placeholder="New password"
          value={form.new_password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full border rounded-md px-3 py-2"
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm new password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          className="w-full border rounded-md px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Updating..." : "Change password"}
        </button>
      </form>
    </div>
  );
}