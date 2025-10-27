import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "./Navbar.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
};

export default ProtectedRoute;
