import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Import Icons
import logo from "../assets/logo.png";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Visibility States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hook to get the URL parameters
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery();
  const navigate = useNavigate();

  // ✅ USE ENV VARIABLE
  const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const tokenParam = query.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(true);
      setMessage("Invalid or missing reset token.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      setError(true);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        token: token,
        newPassword: newPassword,
      });

      setError(false);
      setMessage("Success! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        {/* ✅ LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={logo}
            alt="ASCON Logo"
            style={{ width: "100px", height: "auto" }}
          />
        </div>

        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">Enter your new password below.</p>

        {message && (
          <div
            className={error ? "reset-error-banner" : "reset-success-banner"}
          >
            {message}
          </div>
        )}

        {!token ? (
          <p style={{ color: "red" }}>Error: No token found in URL.</p>
        ) : (
          <form onSubmit={handleSubmit} className="reset-form">
            {/* ✅ New Password Input with Eye Icon */}
            <div className="password-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                className="reset-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* ✅ Confirm Password Input with Eye Icon */}
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="reset-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="reset-button" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
