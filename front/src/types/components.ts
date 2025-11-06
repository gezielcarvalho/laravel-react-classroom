import { Student } from "./api";

export interface StudentFormState {
  name: string;
  course: string;
  email: string;
  phone: string;
}

export interface StudentEditState extends StudentFormState {
  id: string;
}

export interface StudentListState {
  students: Student[];
  loading: boolean;
}

export interface WithRouterProps {
  match: {
    params: {
      id: string;
    };
  };
}
