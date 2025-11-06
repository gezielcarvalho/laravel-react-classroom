import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { StudentService } from "../services/studentService";
import { StudentEditState } from "../types/components";
import swal from "sweetalert";

const EditStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentEditState>({
    id: "",
    name: "",
    course: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const res = await StudentService.getStudent(parseInt(id));
        if (res.status === 200) {
          setStudent({ ...res.data.student });
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsUpdating(true);
      const updateData = {
        id: parseInt(id),
        name: student.name,
        course: student.course,
        email: student.email,
        phone: student.phone,
      };
      const res = await StudentService.updateStudent(parseInt(id), updateData);
      if (res.status === 200) {
        swal(
          "Success!",
          res.data.message || "Student updated successfully",
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating student:", error);
      swal("Error!", "Failed to update student", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h2>Loading...</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>
                Edit Students
                <Link to="/" className="btn btn-primary btn-sm float-end">
                  Back
                </Link>
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={updateStudent}>
                <div className="form-group mb-3">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={student.name}
                    onChange={handleInput}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Course</label>
                  <input
                    type="text"
                    name="course"
                    value={student.course}
                    onChange={handleInput}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={student.email}
                    onChange={handleInput}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={student.phone}
                    onChange={handleInput}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
