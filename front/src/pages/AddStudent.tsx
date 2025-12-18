import React, { Component } from "react";
import { Link } from "react-router-dom";
import swal from "sweetalert";
import { StudentService } from "../services/studentService";
import { StudentFormState } from "../types/components";

class AddStudent extends Component<{}, StudentFormState> {
  state: StudentFormState = {
    name: "",
    course: "",
    email: "",
    phone: "",
  };

  handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({
      ...this.state,
      [name]: value,
    });
  };

  saveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const originControl = document.getElementById(
      "saveBtn"
    ) as HTMLButtonElement;

    if (originControl) {
      originControl.innerText = "Saving...";
    }

    try {
      const res = await StudentService.createStudent(this.state);
      if (res.status >= 200 && res.status < 300) {
        // Accept 200 OK or 201 Created
        swal("Success!", res.data.message, "success");

        if (originControl) {
          originControl.innerText = "Save";
        }

        this.setState({
          name: "",
          course: "",
          email: "",
          phone: "",
        });
      }
    } catch (error) {
      console.error("Error saving student:", error);
      if (originControl) {
        originControl.innerText = "Save";
      }
    }
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4>
                  Add Students
                  <Link to="/" className="btn btn-primary btn-sm float-end">
                    Back
                  </Link>
                </h4>
              </div>
              <div className="card-body">
                <form onSubmit={this.saveStudent}>
                  <div className="form-group mb-3">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={this.state.name}
                      onChange={this.handleInput}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="course">Course</label>
                    <input
                      id="course"
                      type="text"
                      name="course"
                      value={this.state.course}
                      onChange={this.handleInput}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={this.state.email}
                      onChange={this.handleInput}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={this.state.phone}
                      onChange={this.handleInput}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group mb-3">
                    <button
                      id="saveBtn"
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AddStudent;
