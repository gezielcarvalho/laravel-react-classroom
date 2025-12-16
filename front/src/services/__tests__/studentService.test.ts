import axios from "axios";
import { StudentService } from "../studentService";

jest.mock("../apiClient", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import apiClient from "../apiClient";
const mockedApiClient = apiClient as any;

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
      mockedApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.getStudents();

      expect(mockedApiClient.get).toHaveBeenCalledWith("/api/students");
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
        status: 201,
        data: { message: "Student created" },
      };
      mockedApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.createStudent(mockStudent);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/api/students",
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
      mockedApiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.updateStudent(1, mockStudent);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/api/students/1",
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
      mockedApiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await StudentService.deleteStudent(1);

      expect(mockedApiClient.delete).toHaveBeenCalledWith("/api/students/1");
      expect(result).toEqual(mockResponse);
    });
  });
});
