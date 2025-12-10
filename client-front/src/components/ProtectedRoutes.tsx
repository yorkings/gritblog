import { Navigate, Outlet } from "react-router-dom";
import { AuthStore } from "../lib/AuthStore";

const ProtectedRoutes = () => {
    const {isAuthenticated } = AuthStore(); 
    if(!isAuthenticated ){
        return <Navigate to='/login' replace/>
    }
  return <Outlet/>
}

export default ProtectedRoutes
