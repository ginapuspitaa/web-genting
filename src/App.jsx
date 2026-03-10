import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/Dashboard";
import Document from "./pages/Document";
import Upload from "./pages/Upload";
import Category from "./pages/Category";
import User from "./pages/User";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/document" element={<Document />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/category" element={<Category />} />
      <Route path="/user" element={<User />} />
    </Routes>
  );
}

export default App;