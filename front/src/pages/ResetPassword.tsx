import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthService from "../services/authService";
import CaptchaService from "../services/captchaService";

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
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");

  const fetchCaptcha = async () => {
    try {
      const res = await CaptchaService.getCaptcha();
      setCaptchaQuestion(res.data.question);
      setCaptchaToken(res.data.token);
      setCaptchaInput("");
    } catch (e) {}
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

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
        captcha_token: captchaToken || undefined,
        captcha_answer: captchaInput,
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
                  <label htmlFor="reset-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="reset-password" className="form-label">
                    New Password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="reset-password-confirm"
                    className="form-label"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="reset-password-confirm"
                    type="password"
                    className="form-control"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">CAPTCHA</label>
                  <div className="d-flex align-items-center">
                    <div className="form-control w-auto me-2">
                      {captchaQuestion} =
                    </div>
                    <input
                      className="form-control w-50"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Answer"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary ms-2"
                      onClick={fetchCaptcha}
                    >
                      Refresh
                    </button>
                  </div>
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
