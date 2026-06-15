import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "@/pages/MainMenu";
import LevelSelect from "@/pages/LevelSelect";
import Game from "@/pages/Game";
import Shop from "@/pages/Shop";
import Achievements from "@/pages/Achievements";
import Leaderboard from "@/pages/Leaderboard";
import Settings from "@/pages/Settings";
import { AchievementNotificationContainer } from "@/components/game/AchievementNotification";

export default function App() {
  return (
    <Router>
      <AchievementNotificationContainer />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/level-select" element={<LevelSelect />} />
        <Route path="/game" element={<Game />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
