export interface Student {
  id: number;
  name: string;
  course: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

export interface StudentsResponse extends ApiResponse {
  students: Student[];
}

export interface StudentResponse extends ApiResponse {
  student: Student;
}

export interface CreateStudentRequest {
  name: string;
  course: string;
  email: string;
  phone: string;
}

export interface UpdateStudentRequest extends CreateStudentRequest {
  id: number;
}
