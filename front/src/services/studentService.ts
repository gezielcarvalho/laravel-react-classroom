import apiClient from "./apiClient";
import { CreateStudentRequest, UpdateStudentRequest } from "../types/api";

export class StudentService {
  static async getStudents(): Promise<any> {
    return apiClient.get("/api/students");
  }

  static async getStudent(id: number): Promise<any> {
    return apiClient.get(`/api/students/${id}`);
  }

  static async createStudent(student: CreateStudentRequest): Promise<any> {
    return apiClient.post("/api/students", student);
  }

  static async updateStudent(
    id: number,
    student: UpdateStudentRequest
  ): Promise<any> {
    return apiClient.put(`/api/students/${id}`, student);
  }

  static async deleteStudent(id: number): Promise<any> {
    return apiClient.delete(`/api/students/${id}`);
  }
}
