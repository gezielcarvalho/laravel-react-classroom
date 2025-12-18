import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ForgotPassword from "../ForgotPassword";
import AuthService from "../../services/authService";

jest.mock("../../services/authService");

describe("ForgotPassword page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

  it("shows error message from response when forgotPassword rejects with message", async () => {
    (AuthService.forgotPassword as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Email not found" } },
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "missing@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText("Email not found")).toBeInTheDocument();
  });

  it("shows generic error when forgotPassword rejects without response message", async () => {
    (AuthService.forgotPassword as jest.Mock).mockRejectedValueOnce(
      new Error()
    );

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "error@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByText("Failed to send reset link")
    ).toBeInTheDocument();
  });

  it("does nothing when response status is not 200 (no message shown)", async () => {
    (AuthService.forgotPassword as jest.Mock).mockResolvedValue({
      status: 500,
    });

    render(<ForgotPassword />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "foo@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    // wait a bit for any async work
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByText(/reset link sent/i)).toBeNull();
  });
});
