import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden
  >
    <path d="M6 8a.5.5 0 0 0 .5.5H11a.5.5 0 0 0 0-1H6.5A.5.5 0 0 0 6 8z" />
    <path d="M13 8a5 5 0 1 0-10 0 5 5 0 0 0 10 0zM8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M6.146 11.354a.5.5 0 0 0 .708 0L10 8.207l-3.146-3.147a.5.5 0 0 0-.708.708L8.793 8l-2.647 2.646a.5.5 0 0 0 0 .708z"
    />
    <path
      fillRule="evenodd"
      d="M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0z"
    />
  </svg>
);

const Toolbar: React.FC = () => {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // ignore for now; UI will update on context change
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Classroom
        </Link>

        <div className="d-flex align-items-center ms-auto">
          {loading ? (
            <div
              className="spinner-border spinner-border-sm text-secondary"
              role="status"
              aria-hidden
            ></div>
          ) : user ? (
            <>
              <span className="me-3">{user.name}</span>
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogoutIcon />
                <span className="ms-2">Logout</span>
              </button>
            </>
          ) : (
            <Link
              className="btn btn-primary btn-sm d-flex align-items-center"
              to="/login"
              aria-label="Login"
            >
              <LoginIcon />
              <span className="ms-2">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Toolbar;
