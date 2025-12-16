import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Toolbar from "../Toolbar";
import { MemoryRouter } from "react-router-dom";

// Mock useAuth to control auth state
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logout: jest.fn(),
  }),
}));

describe("Toolbar", () => {
  it("shows Login button when not authenticated", () => {
    render(
      <MemoryRouter>
        <Toolbar />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("calls logout when clicking logout button", () => {
    // Simulate logged-in user by spying on useAuth
    const AuthCtx = require("../../contexts/AuthContext");
    const logoutMock = jest.fn().mockResolvedValue(undefined);
    jest
      .spyOn(AuthCtx, "useAuth")
      .mockReturnValue({
        user: { name: "Test" },
        loading: false,
        logout: logoutMock,
      });

    const { getByRole } = render(
      <MemoryRouter>
        <Toolbar />
      </MemoryRouter>
    );
    const btn = getByRole("button", { name: /logout/i });
    fireEvent.click(btn);

    expect(logoutMock).toHaveBeenCalled();
  });
});
