import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "../Signup";

// Mock useAuth to provide a register function that we can control in tests
jest.mock("../../contexts/AuthContext", () => {
  const registerMock = jest.fn().mockResolvedValue(undefined);
  return {
    __esModule: true,
    useAuth: () => ({ register: registerMock }),
    // export the mock so tests can access it via require
    registerMock,
  };
});

describe("Signup page", () => {
  let registerMock: jest.Mock<any, any>;
  beforeEach(() => {
    const mod = require("../../contexts/AuthContext");
    registerMock = mod.registerMock;
    registerMock.mockReset();
    registerMock.mockResolvedValue(undefined);
  });

  it("renders and submits the form", async () => {
    const { container } = render(<Signup />);
    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    const emailInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];
    const button = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.change(confirmInput, { target: { value: "password" } });

    fireEvent.click(button);

    // Wait for register to have been called
    await screen.findByRole("button", { name: /sign up/i });
    expect(registerMock).toHaveBeenCalledWith(
      "Test User",
      "test@example.com",
      "password",
      "password"
    );

    // Since register is mocked to resolve, we expect no error to be shown
    const alert = screen.queryByRole("alert");
    expect(alert).toBeNull();
  });

  it("shows error message from response when register rejects with message", async () => {
    registerMock.mockRejectedValueOnce({
      response: { data: { message: "Email already taken" } },
    });

    const { container } = render(<Signup />);
    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    const emailInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];
    const button = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "taken@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.change(confirmInput, { target: { value: "password" } });

    fireEvent.click(button);

    const alert = await screen.findByText("Email already taken");
    expect(alert).toBeInTheDocument();
  });

  it("shows generic error message when register rejects without response message", async () => {
    registerMock.mockRejectedValueOnce(new Error("network"));

    const { container } = render(<Signup />);
    const inputs = container.querySelectorAll("input");
    const nameInput = inputs[0];
    const emailInput = inputs[1];
    const passwordInput = inputs[2];
    const confirmInput = inputs[3];
    const button = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test2@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.change(confirmInput, { target: { value: "password" } });

    fireEvent.click(button);

    const alert = await screen.findByText("Registration failed");
    expect(alert).toBeInTheDocument();
  });
});
