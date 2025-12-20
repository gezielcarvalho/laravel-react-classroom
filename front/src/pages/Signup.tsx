import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import CaptchaService from "../services/captchaService";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const { register } = useAuth();

  const fetchCaptcha = async () => {
    try {
      const res = await CaptchaService.getCaptcha();
      setCaptchaQuestion(res.data.question);
      setCaptchaToken(res.data.token);
      setCaptchaInput("");
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password, passwordConfirmation, {
        token: captchaToken || undefined,
        answer: captchaInput,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card mt-5">
            <div className="card-header">Sign up</div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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
                  <label className="form-label">Password</label>
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
                  Sign up
                </button>
                <div className="mt-3">
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
