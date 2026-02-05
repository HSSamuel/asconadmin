// ascon_web_admin/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode"; // Fixed import syntax
import axios from "axios"; // ✅ NEW: Required for refresh call

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Optional: Store decoded user info
  const [isLoading, setIsLoading] = useState(true);

  // ✅ NEW: Silent Refresh Logic
  const checkTokenExpiry = async (currentToken) => {
    try {
      const decoded = jwtDecode(currentToken);
      const currentTime = Date.now() / 1000;

      // If token expires in less than 5 minutes (300 seconds), try to refresh
      if (decoded.exp - currentTime < 300) {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return;

        // Call Backend Refresh Endpoint
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || "https://ascon-st50.onrender.com"}/api/auth/refresh`,
          { refreshToken },
        );

        if (response.data && response.data.token) {
          login(response.data.token); // Update state with new token (preserves refresh token)
          console.log("🔄 Session silently refreshed");
        }
      }
    } catch (error) {
      console.warn("Silent refresh failed or token invalid", error);
      // Optional: logout() if refresh completely fails
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn("Stored token is expired.");
          logout();
        } else {
          setToken(storedToken);
          setUser(decoded);

          // ✅ NEW: Trigger immediate check and set interval
          checkTokenExpiry(storedToken);
          const interval = setInterval(
            () => checkTokenExpiry(storedToken),
            120000,
          ); // Check every 2 mins
          return () => clearInterval(interval);
        }
      } catch (e) {
        console.error("Invalid token format.");
        logout();
      }
    }
    setIsLoading(false);
  }, [token]); // ✅ Dependency added so interval resets on token change

  // ✅ UPDATED: Accept refreshToken optionally
  const login = (newToken, newRefreshToken = null) => {
    localStorage.setItem("auth_token", newToken);
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }

    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded);
    } catch (e) {
      console.error("Failed to decode token on login");
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token"); // ✅ Clean up refresh token
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
