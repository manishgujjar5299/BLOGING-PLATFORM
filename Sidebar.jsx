import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/write-blog">Write Blog</NavLink>
      <NavLink to="/my-blogs">My Blogs</NavLink>
      <NavLink to="/drafts">Drafts</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </div>
  );
}
export default Sidebar;
