import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditStudent from "../EditStudent";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StudentService } from "../../services/studentService";
import swal from "sweetalert";

jest.mock("../../services/studentService");
const mockedService = StudentService as any;

jest.mock("sweetalert", () => jest.fn());
const mockedSwal = swal as jest.MockedFunction<typeof swal>;

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithId = (id: string) => {
  return render(
    <MemoryRouter initialEntries={[`/edit-student/${id}`]}>
      <Routes>
        <Route path="/edit-student/:id" element={<EditStudent />} />
      </Routes>
    </MemoryRouter>
  );
};

test("shows loading then renders student form with fetched values", async () => {
  mockedService.getStudent.mockResolvedValue({
    status: 200,
    data: {
      student: {
        id: 1,
        name: "Alice",
        course: "Math",
        email: "a@b.com",
        phone: "123",
      },
    },
  });

  renderWithId("1");

  // Loading should be visible immediately
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for values to be rendered
  await screen.findByDisplayValue("Alice");
  expect(screen.getByDisplayValue("Math")).toBeInTheDocument();
  expect(screen.getByDisplayValue("a@b.com")).toBeInTheDocument();
  expect(screen.getByDisplayValue("123")).toBeInTheDocument();
});

test("updates input values and calls updateStudent on submit, showing success swal", async () => {
  mockedService.getStudent.mockResolvedValue({
    status: 200,
    data: {
      student: {
        id: 2,
        name: "Bob",
        course: "Physics",
        email: "b@b.com",
        phone: "555",
      },
    },
  });

  mockedService.updateStudent.mockResolvedValue({
    status: 200,
    data: { message: "Updated" },
  });

  renderWithId("2");

  await screen.findByDisplayValue("Bob");

  const nameInput = screen.getByDisplayValue("Bob") as HTMLInputElement;
  fireEvent.change(nameInput, { target: { value: "Bobby" } });
  expect(nameInput.value).toBe("Bobby");

  const updateBtn = screen.getByRole("button", { name: /update/i });
  fireEvent.click(updateBtn);

  await waitFor(() =>
    expect(mockedService.updateStudent).toHaveBeenCalledWith(
      2,
      expect.any(Object)
    )
  );
  expect(mockedService.updateStudent).toHaveBeenCalledWith(2, {
    id: 2,
    name: "Bobby",
    course: "Physics",
    email: "b@b.com",
    phone: "555",
  });

  await waitFor(() =>
    expect(mockedSwal).toHaveBeenCalledWith("Success!", "Updated", "success")
  );

  // Button text should be back to Update
  expect(updateBtn).toHaveTextContent("Update");
});

test("shows error swal when updateStudent fails and logs error", async () => {
  mockedService.getStudent.mockResolvedValue({
    status: 200,
    data: {
      student: {
        id: 3,
        name: "Sam",
        course: "Bio",
        email: "s@b.com",
        phone: "999",
      },
    },
  });

  const err = new Error("Network");
  mockedService.updateStudent.mockRejectedValue(err);
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  renderWithId("3");
  await screen.findByDisplayValue("Sam");

  fireEvent.click(screen.getByRole("button", { name: /update/i }));

  await waitFor(() =>
    expect(consoleSpy).toHaveBeenCalledWith("Error updating student:", err)
  );
  await waitFor(() =>
    expect(mockedSwal).toHaveBeenCalledWith(
      "Error!",
      "Failed to update student",
      "error"
    )
  );

  consoleSpy.mockRestore();
});
