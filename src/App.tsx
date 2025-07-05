import Dashboard from "@/pages/Dashboard";
import Detail from "@/pages/Detail";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/url/:id" element={<Detail />} />
      </Routes>
    </Router>
  );
}

export default App;
