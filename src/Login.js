import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // ✅ Consumes the Context directly
import "./Toast.css"; // Preserving your existing styles

const Login = () => {
  // 1. State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. Hooks
  const { login } = useAuth(); // Get the login function from context
  const navigate = useNavigate();

  // 3. Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API Call to Backend
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      // ✅ Success: Pass token to AuthContext
      // The context will handle localStorage and state updates
      if (res.data && res.data.token) {
        login(res.data.token);
        navigate("/"); // Redirect to Dashboard
      } else {
        setError("Login successful but no token received.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      // specific error message from backend or generic fallback
      const errorMsg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Render UI
  return (
    <div
      className="login-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div
        className="card shadow-sm p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          borderRadius: "10px",
          border: "none",
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-4">
          <img
            src="/logo.png" // Assumes logo.png is in your public folder
            alt="ASCON Logo"
            style={{ width: "80px", marginBottom: "15px" }}
          />
          <h4 className="fw-bold text-dark">Admin Portal</h4>
          <p className="text-muted small">Sign in to manage the platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
            style={{ fontSize: "0.9rem" }}
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@ascon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ borderLeft: "none" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />
              <label className="form-check-label small" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a
              href="/reset-password"
              className="text-decoration-none small text-primary"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
            style={{ backgroundColor: "#1B5E3A", borderColor: "#1B5E3A" }} // Uses your ASCON green
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted small mb-0">
            Having trouble?{" "}
            <a href="mailto:support@ascon.com">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
