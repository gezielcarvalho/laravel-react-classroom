import { CreateStudentRequest, UpdateStudentRequest } from "./api";

export interface StudentService {
  getStudents(): Promise<any>;
  getStudent(id: number): Promise<any>;
  createStudent(student: CreateStudentRequest): Promise<any>;
  updateStudent(id: number, student: UpdateStudentRequest): Promise<any>;
  deleteStudent(id: number): Promise<any>;
}
