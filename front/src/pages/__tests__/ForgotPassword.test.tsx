import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ForgotPassword from "../ForgotPassword";
import AuthService from "../../services/authService";

jest.mock("../../services/authService");

describe("ForgotPassword page", () => {
  it("submits email and shows success message", async () => {
    (AuthService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 200,
    });
    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "foo@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/reset link sent/i)).toBeInTheDocument();
  });
});
