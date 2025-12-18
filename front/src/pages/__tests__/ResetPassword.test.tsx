import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../ResetPassword";
import AuthService from "../../services/authService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../services/authService");

describe("ResetPassword page", () => {
  it("prefills email from query and submits new password showing success", async () => {
    (AuthService.resetPassword as jest.Mock).mockResolvedValue({ status: 200 });

    render(
      <MemoryRouter
        initialEntries={["/password/reset?token=abc&email=foo@example.com"]}
      >
        <Routes>
          <Route path="/password/reset" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    // email should be prefilled from query
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe(
      "foo@example.com"
    );

    // ensure labels are present (covers label nodes)
    expect(screen.getByText(/new password/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText(/password reset successful/i)
    ).toBeInTheDocument();
  });

  it("navigates to login after success timeout", async () => {
    jest.useFakeTimers();
    (AuthService.resetPassword as jest.Mock).mockResolvedValue({ status: 200 });

    render(
      <MemoryRouter
        initialEntries={["/password/reset?token=abc&email=foo@example.com"]}
      >
        <Routes>
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText(/password reset successful/i)
    ).toBeInTheDocument();

    // advance time and expect navigation
    jest.advanceTimersByTime(1500);

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("shows error message from response when reset fails with message", async () => {
    (AuthService.resetPassword as jest.Mock).mockRejectedValueOnce({
      response: { data: { message: "Invalid token" } },
    });

    render(
      <MemoryRouter
        initialEntries={["/password/reset?token=abc&email=foo@example.com"]}
      >
        <Routes>
          <Route path="/password/reset" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText("Invalid token")).toBeInTheDocument();
  });

  it("shows generic error when reset fails without response message", async () => {
    (AuthService.resetPassword as jest.Mock).mockRejectedValueOnce(new Error());

    render(
      <MemoryRouter
        initialEntries={["/password/reset?token=abc&email=foo@example.com"]}
      >
        <Routes>
          <Route path="/password/reset" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(
      await screen.findByText("Failed to reset password")
    ).toBeInTheDocument();
  });

  it("does nothing when response status is not 200 (no message or navigation)", async () => {
    jest.useFakeTimers();
    (AuthService.resetPassword as jest.Mock).mockResolvedValue({ status: 400 });

    render(
      <MemoryRouter
        initialEntries={["/password/reset?token=abc&email=foo@example.com"]}
      >
        <Routes>
          <Route path="/password/reset" element={<ResetPassword />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: "newpass" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "newpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    // Ensure no success message appears
    await waitFor(() => {
      expect(screen.queryByText(/password reset successful/i)).toBeNull();
    });

    // Even after timeout there should be no navigation to login
    jest.advanceTimersByTime(1500);
    expect(screen.queryByText(/login page/i)).toBeNull();

    jest.useRealTimers();
  });
});
