import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "./api";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-heading text-5xl font-bold text-white mb-4">
        Link<span className="text-accent">Hub</span>
      </h1>
      <p className="font-body text-gray-400 text-lg mb-8">
        Shorten links. Track clicks. Build your bio page.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-primary hover:bg-primary-dark transition-colors text-white px-6 py-3 rounded-lg font-semibold"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-6 py-3 rounded-lg font-semibold"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);

      const me = await api.get("/auth/me");
      localStorage.setItem("username", me.data.username);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h2 className="font-heading text-3xl font-bold text-white mb-6 text-center">
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark transition-colors text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { email, username, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h2 className="font-heading text-3xl font-bold text-white mb-6 text-center">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="text"
            placeholder="Username (for your bio page)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark transition-colors text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [links, setLinks] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLinks = async () => {
    try {
      const res = await api.get("/links");
      setLinks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { destination_url: destinationUrl };
      if (customSlug) payload.custom_slug = customSlug;
      await api.post("/links", payload);
      setDestinationUrl("");
      setCustomSlug("");
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create link.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this link?")) return;
    await api.delete("/links/" + id);
    fetchLinks();
  };

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
  };

  const handleQrCode = async (id) => {
    try {
      const res = await api.get("/links/" + id + "/qrcode", {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(res.data);
      window.open(imageUrl, "_blank");
    } catch (err) {
      alert("Could not generate QR code.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">
          My Links
        </h1>
        <div className="flex gap-3">
          <Link to="/dashboard/bio" className="text-primary hover:underline text-sm self-center">
            Edit Bio Page
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col gap-3"
      >
        <input
          type="url"
          placeholder="Paste a long URL here..."
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
          className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Custom slug (optional)"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accent-dark transition-colors text-[#0F0F1A] py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Creating..." : "Shorten Link"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {links.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No links yet — create your first one above.
          </p>
        )}
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-[#1A1A2E] border border-white/10 rounded-xl p-4 flex justify-between items-center gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-accent font-semibold truncate">{link.short_url}</p>
              <p className="text-gray-400 text-sm truncate">{link.destination_url}</p>
              <p className="text-gray-500 text-xs mt-1">{link.total_clicks} clicks</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => handleCopy(link.short_url)}
                className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
              >
                Copy
              </button>
              <button
                onClick={() => handleQrCode(link.id)}
                className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
              >
                QR
              </button>
              <Link
                to={"/dashboard/analytics/" + link.id}
                className="text-sm bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20"
              >
                Stats
              </Link>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-sm bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  const { linkId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/links/" + linkId + "/analytics")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics."));
  }, [linkId]);

  if (error) {
    return <div className="text-red-400 p-8 text-center">{error}</div>;
  }

  if (!data) {
    return <div className="text-white p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">Link Analytics</h1>
        <Link to="/dashboard" className="text-primary hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 mb-6 text-center">
        <p className="text-gray-400 text-sm">Total Clicks</p>
        <p className="text-accent font-heading text-5xl font-bold">{data.total_clicks}</p>
      </div>

      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Clicks Over Time</h2>
        {data.clicks_over_time.length === 0 ? (
          <p className="text-gray-500 text-sm">No clicks yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.clicks_over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1A1A2E", border: "1px solid #ffffff1a" }} />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Device Breakdown</h2>
          {data.device_breakdown.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.device_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis dataKey="device_type" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#1A1A2E", border: "1px solid #ffffff1a" }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Top Referrers</h2>
          {data.top_referrers.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.top_referrers.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate">{r.referrer}</span>
                  <span className="text-accent font-semibold">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BioEditorPage() {
  const [profile, setProfile] = useState({
    display_name: "",
    bio_text: "",
    theme: "minimal_light",
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);

  const loadProfile = async () => {
    try {
      const uname = localStorage.getItem("username");
      const res = await api.get("/bio/" + uname);
      setProfile({
        display_name: res.data.display_name || "",
        bio_text: res.data.bio_text || "",
        theme: res.data.theme || "minimal_light",
      });
      setSocialLinks(res.data.social_links || []);
      setUsername(res.data.username);
    } catch (err) {
      // profile abhi khaali ho sakta hai
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await api.put("/bio/me", profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSocial = async (e) => {
    e.preventDefault();
    if (!newLabel || !newUrl) return;
    await api.post("/bio/me/social-links", { label: newLabel, url: newUrl });
    setNewLabel("");
    setNewUrl("");
    loadProfile();
  };

  const handleDeleteSocial = async (id) => {
    await api.delete("/bio/me/social-links/" + id);
    loadProfile();
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-white">Bio Page Editor</h1>
        <Link to="/dashboard" className="text-primary hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>

      {username && (
        <p className="text-gray-400 text-sm mb-6">
          Your public page:{" "}
          <Link to={"/bio/" + username} className="text-accent hover:underline">
            /bio/{username}
          </Link>
        </p>
      )}

      <form
        onSubmit={handleSaveProfile}
        className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 mb-6 flex flex-col gap-3"
      >
        <h2 className="text-white font-semibold mb-2">Profile</h2>
        <input
          type="text"
          placeholder="Display name"
          value={profile.display_name}
          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
        />
        <textarea
          placeholder="Bio text"
          value={profile.bio_text}
          onChange={(e) => setProfile({ ...profile, bio_text: e.target.value })}
          rows={3}
          className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary resize-none"
        />
        <select
          value={profile.theme}
          onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
          className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-primary"
        >
          <option value="minimal_light">Minimal Light</option>
          <option value="dark_slate">Dark Slate</option>
          <option value="gradient">Gradient</option>
        </select>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark transition-colors text-white py-3 rounded-lg font-semibold"
        >
          {saved ? "Saved" : "Save Profile"}
        </button>
      </form>

      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Social Links</h2>

        <div className="flex flex-col gap-2 mb-4">
          {socialLinks.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center bg-[#0F0F1A] rounded-lg px-4 py-2"
            >
              <span className="text-white text-sm">
                {s.label} - <span className="text-gray-400">{s.url}</span>
              </span>
              <button
                onClick={() => handleDeleteSocial(s.id)}
                className="text-red-400 text-sm hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSocial} className="flex gap-2">
          <input
            type="text"
            placeholder="Label (e.g. Instagram)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:border-primary flex-1"
          />
          <input
            type="url"
            placeholder="URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="bg-[#0F0F1A] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:border-primary flex-1"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dark transition-colors text-[#0F0F1A] px-4 py-2 rounded-lg font-semibold"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

const THEME_STYLES = {
  minimal_light: {
    background: "#F5F5F7",
    cardBg: "#FFFFFF",
    textColor: "#111111",
    subTextColor: "#555555",
    buttonBg: "#111111",
    buttonText: "#FFFFFF",
  },
  dark_slate: {
    background: "#0F0F1A",
    cardBg: "#1A1A2E",
    textColor: "#FFFFFF",
    subTextColor: "#9CA3AF",
    buttonBg: "#4F46E5",
    buttonText: "#FFFFFF",
  },
  gradient: {
    background: "linear-gradient(135deg, #4F46E5 0%, #F59E0B 100%)",
    cardBg: "rgba(255,255,255,0.15)",
    textColor: "#FFFFFF",
    subTextColor: "#F0F0F0",
    buttonBg: "rgba(255,255,255,0.9)",
    buttonText: "#111111",
  },
};

function PublicBioPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get("/bio/" + username)
      .then((res) => setProfile(res.data))
      .catch(() => setNotFound(true));
  }, [username]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>This profile does not exist.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const style = THEME_STYLES[profile.theme] || THEME_STYLES.minimal_light;
  const avatarLetter = (profile.display_name || profile.username).charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: style.background }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center shadow-xl"
        style={{ backgroundColor: style.cardBg }}
      >
        <div
          className="w-20 h-20 rounded-full mb-4 flex items-center justify-center text-2xl font-bold font-heading"
          style={{ backgroundColor: style.buttonBg, color: style.buttonText }}
        >
          {avatarLetter}
        </div>

        <h1
          className="font-heading text-2xl font-bold mb-1"
          style={{ color: style.textColor }}
        >
          {profile.display_name || profile.username}
        </h1>
        <p className="text-sm mb-6" style={{ color: style.subTextColor }}>
          @{profile.username}
        </p>

        {profile.bio_text && (
          <p className="text-sm mb-6" style={{ color: style.subTextColor }}>
            {profile.bio_text}
          </p>
        )}

        <div className="w-full flex flex-col gap-3">
          {profile.social_links.length === 0 ? (
            <p className="text-sm" style={{ color: style.subTextColor }}>
              No links added yet.
            </p>
          ) : (
            profile.social_links.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: style.buttonBg, color: style.buttonText }}
              >
                {s.label}
              </a>
            ))
          )}
        </div>
      </div>

      <p className="mt-8 text-xs opacity-50" style={{ color: style.textColor }}>
        Powered by LinkHub
      </p>
    </div>
  );
}

function NotFoundPage() {
  return <div className="text-white p-8">404 - Page not found</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics/:linkId"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bio"
          element={
            <ProtectedRoute>
              <BioEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/bio/:username" element={<PublicBioPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;