import { Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login"; // 핵심

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<App />} />
    </Routes>
  );
}
