import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/http";

type Murmur = {
  id: number;
  text: string;
  userId: number;
  createdAt: string;
  likeCount: number;
  isLikedByMe: boolean;
};

export default function TimelinePage() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Murmur[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Create murmur state
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await http.get(`/murmurs?page=${page}`);
      setItems(res.data.items);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }

  // Create murmur
  async function createMurmur() {
    if (!text.trim()) return;

    setPosting(true);
    try {
      await http.post("/murmurs", { text });
      setText("");
      setPage(1);
      await load();
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(m: Murmur) {
    // optimistic UI
    const next = items.map((x) =>
      x.id === m.id
        ? {
            ...x,
            isLikedByMe: !x.isLikedByMe,
            likeCount: x.likeCount + (x.isLikedByMe ? -1 : 1),
          }
        : x
    );
    setItems(next);

    try {
      if (!m.isLikedByMe) {
        await http.post(`/murmurs/${m.id}/like`);
      } else {
        await http.delete(`/murmurs/${m.id}/like`);
      }
    } catch {
      // rollback if error
      await load();
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <h2>Timeline</h2>

      {/* Create Murmur UI */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 8 }}
        />
        <button
          onClick={createMurmur}
          disabled={posting || !text.trim()}
          style={{ marginTop: 8 }}
        >
          {posting ? "Posting..." : "Post Murmur"}
        </button>
      </div>

      {loading ? <p>Loading...</p> : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <Link to={`/murmurs/${m.id}`} style={{ fontWeight: 600 }}>
                Murmur #{m.id}
              </Link>
              <Link to={`/users/${m.userId}`}>User {m.userId}</Link>
            </div>

            <p style={{ marginTop: 8 }}>{m.text}</p>

            <button onClick={() => toggleLike(m)}>
              {m.isLikedByMe ? "Unlike" : "Like"} ({m.likeCount})
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * 10 >= total}
        >
          Next
        </button>
      </div>
    </div>
  );
}
