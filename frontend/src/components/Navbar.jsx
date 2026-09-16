import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/search", label: "Search" },
  { to: "/files", label: "Files" },
  { to: "/timeline", label: "Timeline" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm px-1 pb-1 border-b-2 transition-colors ${
      isActive
        ? "border-accent text-ink font-medium"
        : "border-transparent text-muted hover:text-ink"
    }`;

  return (
    <div className="border-b border-line bg-paper">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-7">
          <NavLink to="/dashboard" className="font-display text-lg font-semibold shrink-0">
            RecallX
          </NavLink>
          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <button onClick={handleLogout} className="text-sm text-muted hover:text-ink transition-colors">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}