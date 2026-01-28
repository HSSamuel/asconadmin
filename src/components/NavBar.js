import React, { useState, useEffect, useRef } from "react";
import "./NavBar.css";

function NavBar({
  activeTab,
  setActiveTab,
  onLogout,
  userRole,
  theme,
  toggleTheme,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile Menu
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false); // Desktop Dropdown

  // Ref to close dropdown when clicking outside
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false); // Close mobile menu
    setIsDesktopDropdownOpen(false); // Close desktop dropdown
  };

  const navItems = [
    { id: "users", label: "Users", icon: "👥" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "programmes", label: "Programmes", icon: "🎓" },
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "facilities", label: "Facilities", icon: "🏢" },
    { id: "registrations", label: "Registrations", icon: "📋" },
    // ✅ ADDED DOCUMENTS TAB
    { id: "documents", label: "Documents", icon: "📄" },
  ];

  // Get the object for the currently active tab
  const activeItem =
    navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <>
      {/* ==============================
          1. DESKTOP NAVIGATION (Top Bar)
          ============================== */}
      <nav className="desktop-nav">
        <div className="nav-brand">
          <img src="/logo.png" alt="ASCON Logo" className="brand-logo" />
          <span className="brand-text">ASCON Admin</span>
        </div>

        {/* ✅ DROPDOWN MENU CONTAINER */}
        <div className="nav-dropdown-container" ref={dropdownRef}>
          <span className="nav-label-text">Current View:</span>

          <button
            className="dropdown-trigger"
            onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
          >
            <span className="trigger-content">
              {activeItem.icon} {activeItem.label}
            </span>
            <span className="trigger-arrow">
              {isDesktopDropdownOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* THE DROPDOWN LIST */}
          {isDesktopDropdownOpen && (
            <div className="dropdown-menu">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`dropdown-item ${
                    activeTab === item.id ? "active" : ""
                  }`}
                  onClick={() => handleTabClick(item.id)}
                >
                  {item.icon} {item.label}
                  {activeTab === item.id && (
                    <span className="check-mark">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-actions">
          {/* ✅ THEME TOGGLE BUTTON */}
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title="Switch Theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button className="logout-btn" onClick={onLogout}>
            Logout ↪
          </button>
        </div>
      </nav>

      {/* ==============================
          2. MOBILE MENU OVERLAY
          ============================== */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            <h3>Menu</h3>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={activeTab === item.id ? "active-mobile-item" : ""}
                onClick={() => handleTabClick(item.id)}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <hr />
            {/* Mobile Theme Toggle */}
            <button className="mobile-theme-toggle" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>
            <button className="mobile-logout" onClick={onLogout}>
              🚪 Logout
            </button>
            <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
              ▼ Close
            </button>
          </div>
        </div>
      )}

      {/* ==============================
          3. MOBILE BOTTOM BAR
          ============================== */}
      <div className="mobile-bottom-bar">
        <div
          className="bottom-nav-item"
          onClick={() => handleTabClick("users")}
        >
          <span
            className={`icon ${activeTab === "users" ? "active-icon" : ""}`}
          >
            👥
          </span>
          <span className="label">Users</span>
        </div>
        <div
          className="bottom-nav-item"
          onClick={() => handleTabClick("events")}
        >
          <span
            className={`icon ${activeTab === "events" ? "active-icon" : ""}`}
          >
            📅
          </span>
          <span className="label">Events</span>
        </div>
        <div className="fab-container">
          <div className="fab-notch"></div>
          <button
            className="fab-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="fab-icon">☰</span>
          </button>
          <span className="fab-label">Menu</span>
        </div>
        <div
          className="bottom-nav-item"
          onClick={() => handleTabClick("programmes")}
        >
          <span
            className={`icon ${
              activeTab === "programmes" ? "active-icon" : ""
            }`}
          >
            🎓
          </span>
          <span className="label">Progs</span>
        </div>
        <div
          className="bottom-nav-item"
          onClick={() => handleTabClick("registrations")}
        >
          <span
            className={`icon ${
              activeTab === "registrations" ? "active-icon" : ""
            }`}
          >
            📋
          </span>
          <span className="label">Regs</span>
        </div>
      </div>
    </>
  );
}

export default NavBar;
