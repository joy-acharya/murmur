import { Link, Route, Routes } from "react-router-dom";
import TimelinePage from "./pages/TimelinePage";
import MurmurDetailPage from "./pages/MurmurDetailPage";
import MyProfilePage from "./pages/MyProfilePage";
import UserProfilePage from "./pages/UserProfilePage";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Timeline</Link>
        <Link to="/me">My Profile</Link>
        <Link to="/users/2">User 2</Link>
        <Link to="/murmurs/2">Murmur 1</Link>
      </nav>

      <Routes>
        <Route path="/" element={<TimelinePage />} />
        <Route path="/murmurs/:id" element={<MurmurDetailPage />} />
        <Route path="/me" element={<MyProfilePage />} />
        <Route path="/users/:id" element={<UserProfilePage />} />
      </Routes>
    </div>
  );
}
