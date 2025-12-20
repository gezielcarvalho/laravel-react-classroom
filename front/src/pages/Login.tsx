import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CaptchaService from "../services/captchaService";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password, {
        token: captchaToken || undefined,
        answer: captchaInput,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };
  const fetchCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const res = await CaptchaService.getCaptcha();
      setCaptchaQuestion(res.data.question);
      setCaptchaToken(res.data.token);
      setCaptchaInput("");
    } catch (e) {
      // ignore
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <div className="card mt-5">
            <div className="card-header">Login</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="captcha" className="form-label">
                    CAPTCHA: please solve
                  </label>
                  <div className="d-flex align-items-center">
                    <div className="form-control w-auto me-2">
                      {captchaQuestion || (loadingCaptcha ? "loading..." : "-")}{" "}
                      =
                    </div>
                    <input
                      id="captcha"
                      type="text"
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
                <button
                  className="btn btn-primary me-2"
                  type="submit"
                  disabled={!captchaInput}
                >
                  Login
                </button>
                <Link className="btn btn-link me-2" to="/signup">
                  Sign up
                </Link>
                <Link className="btn btn-link" to="/forgot-password">
                  Forgot password?
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
