import { useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import FlagQuiz from "./pages/FlagQuiz";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FlagQuiz />} />
      </Routes>
    </>
  );
}

export default App;
