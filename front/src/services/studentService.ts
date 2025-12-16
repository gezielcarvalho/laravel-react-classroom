import axios from "axios";
import { CreateStudentRequest, UpdateStudentRequest } from "../types/api";

const API_BASE_URL = "http://localhost:8000/api";

export class StudentService {
  static async getStudents(): Promise<any> {
    return axios.get(`${API_BASE_URL}/students`);
  }

  static async getStudent(id: number): Promise<any> {
    return axios.get(`${API_BASE_URL}/students/${id}`);
  }

  static async createStudent(student: CreateStudentRequest): Promise<any> {
    return axios.post(`${API_BASE_URL}/students`, student);
  }

  static async updateStudent(
    id: number,
    student: UpdateStudentRequest
  ): Promise<any> {
    return axios.put(`${API_BASE_URL}/students/${id}`, student);
  }

  static async deleteStudent(id: number): Promise<any> {
    return axios.delete(`${API_BASE_URL}/students/${id}`);
  }
}
