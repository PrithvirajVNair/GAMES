import "./App.css";
import { Route, Routes } from "react-router-dom";
import FlagQuiz from "./pages/FlagQuiz";
import PNF from "./pages/PNF";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FlagQuiz />} />


        
        <Route path="*" element={<PNF />} />
      </Routes>
    </>
  );
}

export default App;
