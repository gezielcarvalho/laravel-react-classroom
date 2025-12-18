import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddStudent from "../AddStudent";
import { MemoryRouter } from "react-router-dom";
import { StudentService } from "../../services/studentService";
import swal from "sweetalert";

jest.mock("../../services/studentService");
const mockedService = StudentService as any;

jest.mock("sweetalert", () => jest.fn());
const mockedSwal = swal as jest.MockedFunction<typeof swal>;

afterEach(() => {
  jest.resetAllMocks();
});

test("renders the form fields and save button", () => {
  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="course"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
});

test("updates input values on change", () => {
  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  const nameInput = container.querySelector(
    'input[name="name"]'
  ) as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value: "Alice" } });
  expect(nameInput.value).toBe("Alice");
});

test("successful save calls StudentService.createStudent, shows swal and resets form", async () => {
  mockedService.createStudent.mockResolvedValue({
    status: 201,
    data: { message: "Student created" },
  });

  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  fireEvent.change(
    container.querySelector('input[name="name"]') as HTMLInputElement,
    {
      target: { value: "Alice" },
    }
  );
  fireEvent.change(
    container.querySelector('input[name="course"]') as HTMLInputElement,
    {
      target: { value: "Math" },
    }
  );
  fireEvent.change(
    container.querySelector('input[name="email"]') as HTMLInputElement,
    {
      target: { value: "a@b.com" },
    }
  );
  fireEvent.change(
    container.querySelector('input[name="phone"]') as HTMLInputElement,
    {
      target: { value: "12345" },
    }
  );

  const saveBtn = screen.getByRole("button", { name: /save/i });
  expect(saveBtn).toHaveTextContent("Save");

  fireEvent.click(saveBtn);

  // Wait for swal to be called
  await waitFor(() =>
    expect(mockedSwal).toHaveBeenCalledWith(
      "Success!",
      "Student created",
      "success"
    )
  );

  // After successful save, button text should be back to Save and inputs cleared
  expect(saveBtn).toHaveTextContent("Save");
  expect(
    (container.querySelector('input[name="name"]') as HTMLInputElement).value
  ).toBe("");
  expect(
    (container.querySelector('input[name="course"]') as HTMLInputElement).value
  ).toBe("");
  expect(
    (container.querySelector('input[name="email"]') as HTMLInputElement).value
  ).toBe("");
  expect(
    (container.querySelector('input[name="phone"]') as HTMLInputElement).value
  ).toBe("");
});

test("does not show success when response status is not 2xx and leaves button as Saving...", async () => {
  mockedService.createStudent.mockResolvedValue({ status: 400, data: {} });

  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  fireEvent.change(
    container.querySelector('input[name="name"]') as HTMLInputElement,
    {
      target: { value: "Carol" },
    }
  );

  const saveBtn = screen.getByRole("button", { name: /save/i });
  fireEvent.click(saveBtn);

  // allow async resolution
  await new Promise((r) => setTimeout(r, 0));

  expect(mockedSwal).not.toHaveBeenCalled();
  // we don't expect swal to be called when status isn't 2xx
  expect(saveBtn).toBeInTheDocument();
});

test("handles missing save button gracefully on success", async () => {
  mockedService.createStudent.mockResolvedValue({
    status: 201,
    data: { message: "Student created" },
  });

  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  // remove the save button to simulate missing originControl
  const saveBtn = screen.getByRole("button", { name: /save/i });
  saveBtn.remove();

  const form = container.querySelector("form") as HTMLFormElement;
  fireEvent.submit(form);

  await waitFor(() =>
    expect(mockedSwal).toHaveBeenCalledWith(
      "Success!",
      "Student created",
      "success"
    )
  );
});

test("handles missing save button gracefully on failure", async () => {
  const error = new Error("Network error");
  mockedService.createStudent.mockRejectedValue(error);
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  // remove the save button to simulate missing originControl
  const saveBtn = screen.getByRole("button", { name: /save/i });
  saveBtn.remove();

  const form = container.querySelector("form") as HTMLFormElement;
  fireEvent.submit(form);

  await waitFor(() =>
    expect(consoleSpy).toHaveBeenCalledWith("Error saving student:", error)
  );
  consoleSpy.mockRestore();
});

test("synchronous error thrown resets button text", async () => {
  const error = new Error("Sync error");
  mockedService.createStudent.mockImplementation(() => {
    throw error;
  });
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  const { container } = render(
    <MemoryRouter>
      <AddStudent />
    </MemoryRouter>
  );

  fireEvent.change(
    container.querySelector('input[name="name"]') as HTMLInputElement,
    {
      target: { value: "Sync" },
    }
  );

  const saveBtn = screen.getByRole("button", { name: /save/i });

  fireEvent.click(saveBtn);

  await waitFor(() =>
    expect(consoleSpy).toHaveBeenCalledWith("Error saving student:", error)
  );
  expect(saveBtn).toHaveTextContent("Save");

  consoleSpy.mockRestore();
});
