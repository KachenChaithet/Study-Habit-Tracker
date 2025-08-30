import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { user } = useAuth();

    
    
    // ถ้า user ไม่มีค่า → ไปหน้า login
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    

    // ถ้า user login แล้ว → render child routes
    return <Outlet />;
};

export default ProtectedRoute;
