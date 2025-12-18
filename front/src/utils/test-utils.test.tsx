import React from "react";
import { render, screen } from "./test-utils";
import { useLocation } from "react-router-dom";

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

test("wraps children with BrowserRouter so useLocation works", () => {
  window.history.pushState({}, "", "/some-path");
  render(<LocationDisplay />);
  expect(screen.getByTestId("location")).toHaveTextContent("/some-path");
});

test("forwards render options like container", () => {
  const container = document.createElement("div");
  // attach to document so `toBeInTheDocument` matcher succeeds
  document.body.appendChild(container);
  render(<div data-testid="custom">ok</div>, { container });
  expect(container.querySelector('[data-testid="custom"]')).toBeInTheDocument();
  document.body.removeChild(container);
});
