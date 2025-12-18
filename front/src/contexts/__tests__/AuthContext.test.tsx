import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import AuthService from "../../services/authService";

jest.mock("../../services/authService");
const mockedAuth = AuthService as any;

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

function TestConsumer() {
  const { user, loading, login, logout, register } = useAuth();
  return (
    <div>
      <div>{loading ? "loading" : user ? `user:${user.name}` : "no-user"}</div>
      <button onClick={() => login("a@b.com", "secret")}>login</button>
      <button onClick={() => register("Joe", "joe@site", "pw", "pw")}>
        register
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

test("fetches user on mount and sets user when getUser returns 200", async () => {
  mockedAuth.getUser.mockResolvedValue({
    status: 200,
    data: { user: { id: 1, name: "Test" } },
  });

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  await screen.findByText(/user:Test/);
});

test("fetches user on mount and sets no-user when getUser fails", async () => {
  mockedAuth.getUser.mockRejectedValue(new Error("no session"));

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  await screen.findByText(/no-user/);
});

test("login uses AuthService.login and navigates on success", async () => {
  // initial fetch returns no user
  mockedAuth.getUser.mockRejectedValue(new Error("no session"));
  mockedAuth.login.mockResolvedValue({
    status: 200,
    data: { user: { id: 2, name: "Bob" } },
  });

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  // wait until initial loading completes
  await screen.findByText(/no-user/);

  fireEvent.click(screen.getByText("login"));

  await screen.findByText(/user:Bob/);
  expect(mockedAuth.login).toHaveBeenCalledWith({
    email: "a@b.com",
    password: "secret",
  });
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("register calls register then login and navigates", async () => {
  mockedAuth.getUser.mockRejectedValue(new Error("no session"));
  mockedAuth.register.mockResolvedValue({ status: 201 });
  mockedAuth.login.mockResolvedValue({
    status: 200,
    data: { user: { id: 3, name: "Joe" } },
  });

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  await screen.findByText(/no-user/);

  fireEvent.click(screen.getByText("register"));

  await screen.findByText(/user:Joe/);
  expect(mockedAuth.register).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("logout calls AuthService.logout, clears user and navigates to login", async () => {
  mockedAuth.getUser.mockResolvedValue({
    status: 200,
    data: { user: { id: 4, name: "Sam" } },
  });
  mockedAuth.logout.mockResolvedValue({ status: 200 });

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  await screen.findByText(/user:Sam/);

  fireEvent.click(screen.getByText("logout"));

  await screen.findByText(/no-user/);
  expect(mockedAuth.logout).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith("/login");
});

test("useAuth throws if used outside provider", () => {
  // Create a component that will call useAuth and render
  function Crashy() {
    // calling will throw
    useAuth();
    return <div />;
  }

  // Rendering Crashy without provider should throw
  expect(() => render(<Crashy />)).toThrow(
    "useAuth must be used within AuthProvider"
  );
});
