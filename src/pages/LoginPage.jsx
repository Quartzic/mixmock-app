import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  useAuthState,
  useSignInWithGoogle,
  useSignOut,
} from "react-firebase-hooks/auth";

export const LoginPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [signOut] = useSignOut(auth);
  
  return (
    user ? <Navigate to="/" /> :
    <div className="h-screen">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to Mixtape Mocktails
          </h2>
        </div>
        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
          {user ? (
            <>
              <p className="text-center">You are logged in as {user.email}.</p>
              <button
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-md bg-red-500 px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                onClick={() => {
                  signOut();
                }}
              >
                <span className="text-sm font-semibold leading-6">
                  Sign out
                </span>
              </button>
            </>
          ) : (
            <button
              className="flex w-full items-center justify-center gap-3 rounded-md bg-indigo-500 px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
              onClick={() => {
                signInWithGoogle();
              }}
            >
              <span className="text-sm font-semibold leading-6">
                Sign in with Google
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
