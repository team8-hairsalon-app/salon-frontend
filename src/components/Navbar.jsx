import { NavLink } from "react-router-dom";

const linkCls = ({ isActive }) =>
  "px-3 py-2 rounded hover:underline " + (isActive ? "font-semibold underline" : "");

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <NavLink to="/" className={linkCls}>Home</NavLink>
      <NavLink to="/gallery" className={linkCls}>Gallery</NavLink>
      <NavLink to="/booking" className={linkCls}>Booking</NavLink>
      <NavLink to="/login" className={linkCls}>Login</NavLink>
      <NavLink to="/profile" className={linkCls}>Profile</NavLink>
    </nav>
  );
}
