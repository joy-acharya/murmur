import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/http";

const ME_ID = 1;

type Profile = {
  id: number;
  name: string;
  email?: string;
  followingCount: number;
  followerCount: number;
};

type Murmur = {
  id: number;
  text: string;
  userId: number;
  createdAt: string;
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Murmur[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    const [p, m] = await Promise.all([
      http.get(`/users/${ME_ID}`),
      http.get(`/users/${ME_ID}/murmurs?page=${page}`),
    ]);
    setProfile(p.data);
    setItems(m.data.items);
    setTotal(m.data.total);
  }

  async function deleteMurmur(id: number) {
    await http.delete(`/murmurs/${id}`);
    await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <p>
        <b>{profile.name}</b> {profile.email ? `(${profile.email})` : ""}
      </p>
      <p>
        Following: {profile.followingCount} | Followers: {profile.followerCount}
      </p>

      <h3>My Murmurs</h3>
      {items.map((m) => (
        <div key={m.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 8 }}>
          <Link to={`/murmurs/${m.id}`}>Murmur #{m.id}</Link>
          <p>{m.text}</p>
          <button onClick={() => deleteMurmur(m.id)}>Delete</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= total}>
          Next
        </button>
      </div>
    </div>
  );
}
