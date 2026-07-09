import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import FlagQuiz from "./pages/FlagQuiz";
import PNF from "./pages/PNF";
import CountryShapeQuiz from "./pages/CountryShapeQuiz";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/flag-quiz" element={<FlagQuiz />} />
        <Route path="/country-shape-quiz" element={<CountryShapeQuiz />} />


        
        <Route path="*" element={<PNF />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
