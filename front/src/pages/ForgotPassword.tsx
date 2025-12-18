import React, { useState } from "react";
import AuthService from "../services/authService";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await AuthService.forgotPassword(email);
      if (res.status === 200) setMessage("Reset link sent to your email");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <div className="card mt-5">
            <div className="card-header">Forgot Password</div>
            <div className="card-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="forgot-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Send reset link
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
