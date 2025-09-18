import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
