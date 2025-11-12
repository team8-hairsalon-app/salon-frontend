import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./lib/auth.jsx";
import Navbar from "./components/Navbar.jsx";

import Home from "./Home.jsx";
import Gallery from "./Gallery.jsx";
import Booking from "./Booking.jsx";
import Profile from "./Profile.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import PaymentSuccess from "./PaymentSuccess.jsx";
import BookingReceived from "./BookingReceived.jsx";

function Protected({ children }) {
  const auth = useAuth();
  if (!auth?.isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Single global toaster. Shorter default + top-right to avoid the mid/top duplicate. */}
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <Navbar />

      <div className="p-6 mx-auto max-w-6xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* New pages */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/booking-received" element={<BookingReceived />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
