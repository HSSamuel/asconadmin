// ascon_web_admin/src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Optional: Store decoded user info
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 1. Stable Login Function
  const login = useCallback((newToken, newRefreshToken = null) => {
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
  }, []);

  // ✅ 2. Stable Logout Function
  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  }, []);

  // ✅ 3. Stable Silent Refresh Logic
  const checkTokenExpiry = useCallback(
    async (currentToken) => {
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
            login(response.data.token); // Update state with new token
            console.log("🔄 Session silently refreshed");
          }
        }
      } catch (error) {
        console.warn("Silent refresh failed or token invalid", error);
      }
    },
    [login],
  );

  // ✅ 4. INITIALIZATION EFFECT (Runs Only Once)
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

          // Trigger immediate check
          checkTokenExpiry(storedToken);

          // Set interval
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
  }, [logout, checkTokenExpiry]); // ❌ REMOVED 'token' from here to prevent loops

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
