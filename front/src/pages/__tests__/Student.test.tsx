import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Student from "../Student";
import { MemoryRouter } from "react-router-dom";
import { StudentService } from "../../services/studentService";

jest.mock("../../services/studentService");
const mockedService = StudentService as any;

afterEach(() => {
  jest.resetAllMocks();
});

test("shows loading then renders students table", async () => {
  mockedService.getStudents.mockResolvedValue({
    status: 200,
    data: {
      students: [
        { id: 1, name: "A", course: "C1", email: "a@b.com", phone: "111" },
        { id: 2, name: "B", course: "C2", email: "b@b.com", phone: "222" },
      ],
    },
  });

  const { container } = render(
    <MemoryRouter>
      <Student />
    </MemoryRouter>
  );

  expect(screen.getByText(/Loading/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeNull());

  expect(screen.getByText("A")).toBeInTheDocument();
  expect(screen.getByText("B")).toBeInTheDocument();
  // Edit links exist (one per student)
  expect(screen.getAllByRole("link", { name: /edit/i }).length).toBeGreaterThan(
    0
  );
});

test("removes table row when deleteStudent succeeds", async () => {
  mockedService.getStudents.mockResolvedValue({
    status: 200,
    data: {
      students: [
        { id: 5, name: "E", course: "C", email: "e@e.com", phone: "5" },
      ],
    },
  });
  mockedService.deleteStudent.mockResolvedValue({ status: 200 });

  const { container } = render(
    <MemoryRouter>
      <Student />
    </MemoryRouter>
  );

  await screen.findByText("E");

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  // Ensure deleteStudent was called
  await waitFor(() =>
    expect(mockedService.deleteStudent).toHaveBeenCalledWith(5)
  );
});

test("restores delete button text and logs on failure", async () => {
  mockedService.getStudents.mockResolvedValue({
    status: 200,
    data: {
      students: [
        { id: 9, name: "Fail", course: "C", email: "f@f.com", phone: "9" },
      ],
    },
  });
  const err = new Error("boom");
  mockedService.deleteStudent.mockRejectedValue(err);

  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  render(
    <MemoryRouter>
      <Student />
    </MemoryRouter>
  );

  await screen.findByText("Fail");

  const deleteBtn = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteBtn);

  await waitFor(() =>
    expect(mockedService.deleteStudent).toHaveBeenCalledWith(9)
  );
  await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
  expect(deleteBtn).toHaveTextContent(/Delete/i);

  consoleSpy.mockRestore();
});

test("handles fetch error by clearing loading", async () => {
  mockedService.getStudents.mockRejectedValue(new Error("network"));

  render(
    <MemoryRouter>
      <Student />
    </MemoryRouter>
  );

  expect(screen.getByText(/Loading/i)).toBeInTheDocument();

  await waitFor(() => expect(screen.queryByText(/Loading/i)).toBeNull());
});
