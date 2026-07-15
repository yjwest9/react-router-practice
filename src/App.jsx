import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import NavBar from "./components/NavBar";
import CardDetailPage from "./components/CardDetailPage";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:id" element={<CardDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
