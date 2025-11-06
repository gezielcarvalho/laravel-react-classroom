import axios from "axios";
import { StudentService } from "../studentService";

jest.mock("axios");
const mockedAxios = axios as any;

describe("StudentService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getStudents", () => {
    it("should fetch students successfully", async () => {
      const mockResponse = {
        status: 200,
        data: { students: [] },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.getStudents();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:8000/api/students"
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createStudent", () => {
    it("should create student successfully", async () => {
      const mockStudent = {
        name: "John Doe",
        course: "Computer Science",
        email: "john@test.com",
        phone: "123456789",
      };
      const mockResponse = {
        status: 200,
        data: { message: "Student created" },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.createStudent(mockStudent);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/api/add-student",
        mockStudent
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateStudent", () => {
    it("should update student successfully", async () => {
      const mockStudent = {
        id: 1,
        name: "Jane Doe",
        course: "Mathematics",
        email: "jane@test.com",
        phone: "987654321",
      };
      const mockResponse = {
        status: 200,
        data: { message: "Student updated" },
      };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.updateStudent(1, mockStudent);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "http://localhost:8000/api/update-student/1",
        mockStudent
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteStudent", () => {
    it("should delete student successfully", async () => {
      const mockResponse = {
        status: 200,
        data: { message: "Student deleted" },
      };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.deleteStudent(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "http://localhost:8000/api/delete-student/1"
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
