import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import LoginForm from "./components/LoginForm.tsx";
import { authService } from "./shared/auth.service.ts";

export function RootComponent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    await authService.login(username, password);
    setIsLoggedIn(true);
  };

  return (
    <React.StrictMode>
      {isLoggedIn ? <App /> : <LoginForm onLogin={handleLogin} />}
    </React.StrictMode>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);
root.render(<RootComponent />);
