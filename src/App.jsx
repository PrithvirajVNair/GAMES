import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FlagQuiz from "./pages/FlagQuiz";
import PNF from "./pages/PNF";
import CountryShapeQuiz from "./pages/CountryShapeQuiz";
import { Analytics } from "@vercel/analytics/react";
import Feedback from "./components/Feedback";
import LogoQuiz from "./pages/LogoQuiz";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Sudoku from "./pages/Sudoku";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flag-quiz" element={<FlagQuiz />} />
        <Route path="/country-shape-quiz" element={<CountryShapeQuiz />} />
        <Route path="/logo-quiz" element={<LogoQuiz />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="*" element={<PNF />} />
      </Routes>
      <Analytics />
      <Feedback />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;

