import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../lib/http";

type Profile = {
  id: number;
  name: string;
  email?: string;
  followingCount: number;
  followerCount: number;
  isFollowedByMe: boolean;
};

type Murmur = {
  id: number;
  text: string;
  userId: number;
  createdAt: string;
};

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Number(id);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Murmur[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function load() {
    const [p, m] = await Promise.all([
      http.get(`/users/${userId}`),
      http.get(`/users/${userId}/murmurs?page=${page}`),
    ]);
    setProfile(p.data);
    setItems(m.data.items);
    setTotal(m.data.total);
  }

  async function toggleFollow() {
    if (!profile) return;
    if (!profile.isFollowedByMe) await http.post(`/users/${userId}/follow`);
    else await http.delete(`/users/${userId}/follow`);
    await load();
  }

  useEffect(() => {
    if (!Number.isFinite(userId)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h2>User Profile</h2>

      <p>
        <b>{profile.name}</b> {profile.email ? `(${profile.email})` : ""}
      </p>

      <p>
        Following: {profile.followingCount} | Followers: {profile.followerCount}
      </p>

      <button onClick={toggleFollow}>
        {profile.isFollowedByMe ? "Unfollow" : "Follow"}
      </button>

      <h3 style={{ marginTop: 16 }}>Murmurs</h3>
      {items.map((m) => (
        <div key={m.id} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 8 }}>
          <Link to={`/murmurs/${m.id}`}>Murmur #{m.id}</Link>
          <p>{m.text}</p>
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

      <p style={{ marginTop: 16 }}>
        Back to <Link to="/">Timeline</Link>
      </p>
    </div>
  );
}
