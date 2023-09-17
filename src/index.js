import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { LoginPage } from "./pages/LoginPage";
import { SpotifyCallback } from "./pages/SpotifyCallback";
import { SpotifyLoginButton } from "./components/SpotifyLoginButton";
import { AuthGuard } from "./components/AuthGuard";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import { MainPage } from "./pages/MainPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard><MainPage/></AuthGuard>,
  },
  {
    path: "/login",
    element: <LoginPage/>,
  },
  {
    path: "/callback",
    element: <SpotifyCallback/>,
  },
  {
    path: "/error",
    element: <div className="bg-red-500">Error</div>,
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <RouterProvider router={router} />
);