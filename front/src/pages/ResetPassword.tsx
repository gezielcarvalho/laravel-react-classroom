import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthService from "../services/authService";

const ResetPassword: React.FC = () => {
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const emailQuery = search.get("email") || "";
  const [email, setEmail] = useState(emailQuery);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await AuthService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (res.status === 200) {
        setMessage("Password reset successful. You may now login.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <div className="card mt-5">
            <div className="card-header">Reset Password</div>
            <div className="card-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Reset password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
