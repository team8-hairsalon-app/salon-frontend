import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import Home from './Home';
import Gallery from './Gallery';
import Booking from './Booking';
import Login from './Login';
import Profile from './Profile';

import './index.css';

function Nav() {
  const base = 'px-2 py-1';
  const active = 'text-blue-600 font-semibold underline';
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/gallery', label: 'Gallery' },
    { to: '/booking', label: 'Booking' },
    { to: '/login', label: 'Login' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="flex gap-4 p-4 border-b border-gray-200">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `${base} ${isActive ? active : ''}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function NotFound() {
  return <h1 className="text-xl text-red-600">Page not found</h1>;
}

function AppShell() {
  return (
    <div className="min-h-screen">
      <Nav />
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
);
