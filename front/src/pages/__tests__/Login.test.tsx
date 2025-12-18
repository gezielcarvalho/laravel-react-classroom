import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../Login";
import { MemoryRouter } from "react-router-dom";
import * as AuthContext from "../../contexts/AuthContext";

afterEach(() => {
  jest.resetAllMocks();
});

test("renders email, password and buttons/links", () => {
  const loginMock = jest.fn();
  jest.spyOn(AuthContext, "useAuth").mockReturnValue({
    user: null,
    loading: false,
    login: loginMock,
    logout: jest.fn(),
    register: jest.fn(),
  } as ReturnType<typeof AuthContext.useAuth>);

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = screen.getByRole("textbox", { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
});

test("successful submit calls login and does not show error", async () => {
  const loginMock = jest.fn().mockResolvedValue({});
  jest.spyOn(AuthContext, "useAuth").mockReturnValue({
    user: null,
    loading: false,
    login: loginMock,
    logout: jest.fn(),
    register: jest.fn(),
  } as ReturnType<typeof AuthContext.useAuth>);

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = screen.getByRole("textbox", { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);

  fireEvent.change(emailInput, { target: { value: "a@b.com" } });
  fireEvent.change(passwordInput, { target: { value: "secret" } });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() =>
    expect(loginMock).toHaveBeenCalledWith("a@b.com", "secret")
  );
  expect(screen.queryByText(/Login failed|Invalid/i)).toBeNull();
});

test("shows error message when login fails", async () => {
  const loginMock = jest.fn().mockRejectedValue({
    response: { data: { message: "Invalid credentials" } },
  });
  jest.spyOn(AuthContext, "useAuth").mockReturnValue({
    user: null,
    loading: false,
    login: loginMock,
    logout: jest.fn(),
    register: jest.fn(),
  } as ReturnType<typeof AuthContext.useAuth>);

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  const emailInput = screen.getByRole("textbox", { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);

  fireEvent.change(emailInput, { target: { value: "a@b.com" } });
  fireEvent.change(passwordInput, { target: { value: "wrong" } });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await screen.findByText(/Invalid credentials/i);
});
