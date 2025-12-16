import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "../Signup";

// Mock useAuth to provide a register function
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    register: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("Signup page", () => {
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

    // Wait for any async actions to resolve
    // Since register is mocked to resolve, we expect no error to be shown
    const alert = screen.queryByRole("alert");
    expect(alert).toBeNull();
  });
});
