import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders students data heading", () => {
  render(<App />);
  const headingElement = screen.getByText(/students data/i);
  expect(headingElement).toBeInTheDocument();
});
