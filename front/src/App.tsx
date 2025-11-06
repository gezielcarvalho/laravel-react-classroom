import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Student from "./pages/Student";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Student />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/edit-student/:id" element={<EditStudent />} />
      </Routes>
    </Router>
  );
};

export default App;
