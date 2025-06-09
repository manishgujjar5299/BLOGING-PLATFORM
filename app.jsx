import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import WriteBlog from "./WriteBlog";
import MyBlogs from "./MyBlogs";
import Drafts from "./Drafts";
import Profile from "./Profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route to redirect to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/client" element={<ClientDashboard />} />
      </Routes>
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/write-blog" element={<WriteBlog />} />
            <Route path="/my-blogs" element={<MyBlogs />} />
            <Route path="/drafts" element={<Drafts />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
