import React from "react";
import { useAuth } from "./useAuthClient";
import "./LoggedOut.css";

const LoggedOut = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Ad Exchange Platform</h1>
        <p>Connect with Internet Identity to get started</p>
        <button onClick={login} className="login-button">
          Connect with Internet Identity
        </button>
      </div>
    </div>
  );
};

export default LoggedOut;