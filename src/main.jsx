import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Gallery from './Gallery'
import Booking from './Booking'
import Login from './Login'
import Profile from './Profile'
import './index.css'

function Nav() {
  return (
    <nav className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
      <Link to="/">Home</Link>
      <Link to="/gallery">Gallery</Link>
      <Link to="/booking">Booking</Link>
      <Link to="/login">Login</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  )
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
        </Routes>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
)
