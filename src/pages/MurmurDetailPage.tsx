import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { http } from "../lib/http";

type Murmur = {
  id: number;
  text: string;
  userId: number;
  createdAt: string;
  likeCount: number;
  isLikedByMe: boolean;
};

export default function MurmurDetailPage() {
  const { id } = useParams();
  const [murmur, setMurmur] = useState<Murmur | null>(null);

  async function load() {
    const res = await http.get(`/murmurs/${id}`);
    setMurmur(res.data);
  }

  async function toggleLike() {
    if (!murmur) return;

    const optimistic = {
      ...murmur,
      isLikedByMe: !murmur.isLikedByMe,
      likeCount: murmur.likeCount + (murmur.isLikedByMe ? -1 : 1),
    };
    setMurmur(optimistic);

    try {
      if (!murmur.isLikedByMe) await http.post(`/murmurs/${murmur.id}/like`);
      else await http.delete(`/murmurs/${murmur.id}/like`);
    } catch {
      await load();
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!murmur) return <p>Loading...</p>;

  return (
    <div>
      <h2>Murmur #{murmur.id}</h2>
      <p>{murmur.text}</p>

      <p>
        By: <Link to={`/users/${murmur.userId}`}>User {murmur.userId}</Link>
      </p>

      <button onClick={toggleLike}>
        {murmur.isLikedByMe ? "Unlike" : "Like"} ({murmur.likeCount})
      </button>
    </div>
  );
}
