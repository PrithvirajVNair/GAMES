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

import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    // Only disable inspect/right-click in production to allow developer testing locally
    if (import.meta.env.PROD) {
      const handleContextMenu = (e) => e.preventDefault();
      
      const handleKeyDown = (e) => {
        // F12
        if (e.keyCode === 123) {
          e.preventDefault();
        }
        // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element selector)
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
          e.preventDefault();
        }
        // Cmd+Opt+I / Cmd+Opt+J (macOS)
        if ((e.metaKey || e.ctrlKey) && e.altKey && (e.keyCode === 73 || e.keyCode === 74)) {
          e.preventDefault();
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
          e.preventDefault();
        }
      };

      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

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

