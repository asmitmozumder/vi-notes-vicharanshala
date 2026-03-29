import { useEffect, useState } from "react";
import axios from "axios";

interface Session {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface HomeProps {
  onOpen: (sessionId: string, content: string, title: string) => void;
  onNew: () => void;
}

const Home = ({ onOpen, onNew }: HomeProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/session", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const preview = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return "Empty session";
    return trimmed.length > 120 ? trimmed.slice(0, 120) + "…" : trimmed;
  };

  return (
    <div className="home-wrapper">
      <div className="home-header">
        <h2 className="home-title">Your sessions</h2>
        <button className="new-btn" onClick={onNew}>
          + New session
        </button>
      </div>

      {loading ? (
        <p className="home-empty">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="home-empty">No sessions yet. Start writing.</p>
      ) : (
        <div className="session-grid">
          {sessions.map((s) => (
            <button
              key={s._id}
              className="session-card"
              onClick={() => onOpen(s._id, s.content, s.title)}
            >
              <p className="session-title">{s.title || "Untitled session"}</p>
              <p className="session-preview">{preview(s.content)}</p>
              <span className="session-date">{formatDate(s.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;