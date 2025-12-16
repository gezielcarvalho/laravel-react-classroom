import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import AuthService from "./services/authService";

jest.mock("./services/authService");
const mockedAuth = AuthService as any;

test("renders students data heading", async () => {
  // Mock getUser to return an authenticated user so AuthProvider doesn't stay in loading state
  mockedAuth.getUser.mockResolvedValue({
    status: 200,
    data: { user: { id: 1, name: "Test" } },
  });

  render(<App />);

  await waitFor(() =>
    expect(screen.getByText(/students data/i)).toBeInTheDocument()
  );
});
