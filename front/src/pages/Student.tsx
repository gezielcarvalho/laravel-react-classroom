import React, { Component } from "react";
import { Link } from "react-router-dom";
import { StudentService } from "../services/studentService";
import { Student as StudentType } from "../types/api";
import { StudentListState } from "../types/components";

class Student extends Component<{}, StudentListState> {
  state: StudentListState = {
    students: [],
    loading: true,
  };

  async componentDidMount() {
    try {
      const res = await StudentService.getStudents();
      if (res.status === 200) {
        this.setState({
          students: res.data.students,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      this.setState({ loading: false });
    }
  }

  deleteStudent = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    const originControl = e.currentTarget;
    originControl.innerText = "Deleting...";

    try {
      const res = await StudentService.deleteStudent(id);
      if (res.status === 200) {
        const tableRow = originControl.closest("tr");
        if (tableRow) {
          tableRow.remove();
        }
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      originControl.innerText = "Delete";
    }
  };

  render() {
    let studentTable: React.ReactNode;

    if (this.state.loading) {
      studentTable = (
        <tr>
          <td colSpan={7}>
            <h2>Loading...</h2>
          </td>
        </tr>
      );
    } else {
      studentTable = this.state.students.map((item: StudentType) => (
        <tr key={item.id} id={item.id.toString()}>
          <td>{item.id}</td>
          <td>{item.name}</td>
          <td>{item.course}</td>
          <td>{item.email}</td>
          <td>{item.phone}</td>
          <td>
            <Link
              to={`/edit-student/${item.id}`}
              className="btn btn-success btn-sm"
            >
              Edit
            </Link>
          </td>
          <td>
            <button
              onClick={(e) => this.deleteStudent(e, item.id)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </td>
        </tr>
      ));
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h4>
                  Students Data
                  <Link
                    to="add-student"
                    className="btn btn-primary btn-sm float-end"
                  >
                    Add Student
                  </Link>
                </h4>
              </div>
              <div className="card-body">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Name</th>
                      <th>Course</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>{studentTable}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Student;
