import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ResetPassword from "../ResetPassword";
import AuthService from "../../services/authService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../services/authService");

describe("ResetPassword page", () => {
  it("submits new password and shows success", async () => {
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
});
