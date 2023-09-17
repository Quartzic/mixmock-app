import { useAuthState } from "react-firebase-hooks/auth" 
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { Spinner } from "./Spinner";

export const AuthGuard = ({ children }) => {
    let [user, loading, error] = useAuthState(auth);
    if (loading) {
        return <div className="flex w-screen h-screen items-center justify-center">
            <Spinner />
        </div>
    }
    if (error) {
        return <div>Error: {error}</div>
    }
    if (!user) {
        return <Navigate to="/login" />
    }
    return children;
}

