import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sheet,
  Typography,
  Tab,
  TabList,
  Tabs,
  TabPanel,
  Table,
  Button,
  IconButton,
  Divider,
  Chip,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Stack,
  Box,
  Tooltip
} from "@mui/joy";

const AdminPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddMentor, setShowAddMentor] = useState(false);
  const [showAssignMentor, setShowAssignMentor] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showEditGithub, setShowEditGithub] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newGithubLink, setNewGithubLink] = useState("");
  const [newStudent, setNewStudent] = useState({
    name: "",
    prn: "",
    email: "",
    password: "",
    mentor_id: "",
    github_link: ""
  });
  const [newMentor, setNewMentor] = useState({
    name: "",
    email: "",
    password: "",
    department: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [resetType, setResetType] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsRes, mentorsRes, projectsRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/admin/students"),
        axios.get("http://127.0.0.1:5000/admin/mentors"),
        axios.get("http://127.0.0.1:5000/admin/projects")
      ]);
      
      // Sort students by student_id
      const sortedStudents = studentsRes.data.sort((a, b) => a.student_id - b.student_id);
      setStudents(sortedStudents);
      
      // Sort mentors by mentor_id
      const sortedMentors = mentorsRes.data.sort((a, b) => a.mentor_id - b.mentor_id);
      setMentors(sortedMentors);
      
      // Sort projects by project_id (extracting numeric part from 'PRJ1001' format)
      const sortedProjects = projectsRes.data.sort((a, b) => {
        // Extract numeric part from project_id (e.g., 'PRJ1001' -> 1001)
        const idA = parseInt(a.project_id.toString().replace(/\D/g,''));
        const idB = parseInt(b.project_id.toString().replace(/\D/g,''));
        return idA - idB;
      });
      
      setProjects(sortedProjects);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.name || !newStudent.prn || !newStudent.email || !newStudent.password) {
        setError("Please fill all required fields");
        return;
      }

      await axios.post("http://127.0.0.1:5000/admin/students", newStudent);
      setShowAddStudent(false);
      setNewStudent({
        name: "",
        prn: "",
        email: "",
        password: "",
        mentor_id: "",
        github_link: ""
      });
      fetchData();
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student. " + (err.response?.data?.message || ""));
    }
  };

  const handleAddMentor = async () => {
    try {
      if (!newMentor.name || !newMentor.email || !newMentor.password) {
        setError("Please fill all required fields");
        return;
      }

      await axios.post("http://127.0.0.1:5000/admin/mentors", newMentor);
      setShowAddMentor(false);
      setNewMentor({
        name: "",
        email: "",
        password: "",
        department: ""
      });
      fetchData();
    } catch (err) {
      console.error("Error adding mentor:", err);
      setError("Failed to add mentor. " + (err.response?.data?.message || ""));
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:5000/admin/students/${studentId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student. " + (err.response?.data?.message || ""));
    }
  };

  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm("Are you sure you want to delete this mentor?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:5000/admin/mentors/${mentorId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting mentor:", err);
      setError("Failed to delete mentor. " + (err.response?.data?.message || ""));
    }
  };
  
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:5000/admin/projects/${projectId}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. " + (err.response?.data?.message || ""));
    }
  };

  const handleAssignMentor = async () => {
    try {
      if (!selectedStudent || !selectedStudent.mentor_id) {
        setError("Please select a mentor");
        return;
      }

      await axios.put("http://127.0.0.1:5000/admin/assign-mentor", {
        student_id: selectedStudent.student_id,
        mentor_id: selectedStudent.mentor_id
      });
      
      setShowAssignMentor(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err) {
      console.error("Error assigning mentor:", err);
      setError("Failed to assign mentor. " + (err.response?.data?.message || ""));
    }
  };
  
  const handleUpdateGithubLink = async () => {
    try {
      if (!newGithubLink) {
        setError("Please enter a GitHub link");
        return;
      }

      await axios.put(`http://127.0.0.1:5000/admin/projects/${selectedProject.id}/github`, {
        github_link: newGithubLink
      });
      
      setShowEditGithub(false);
      setSelectedProject(null);
      setNewGithubLink("");
      fetchData();
    } catch (err) {
      console.error("Error updating GitHub link:", err);
      setError("Failed to update GitHub link. " + (err.response?.data?.message || ""));
    }
  };

  const openEditGithubLink = (project) => {
    setSelectedProject(project);
    setNewGithubLink(project.github_link || "");
    setShowEditGithub(true);
  };

  const openAssignMentor = (student) => {
    setSelectedStudent({ ...student });
    setShowAssignMentor(true);
  };

  const openResetPassword = (user, type) => {
    if (type === "student") {
      setSelectedStudent(user);
      setSelectedMentor(null);
    } else {
      setSelectedMentor(user);
      setSelectedStudent(null);
    }
    setResetType(type);
    setNewPassword("");
    setShowResetPassword(true);
  };

  const handleResetPassword = async () => {
    try {
      if (!newPassword) {
        setError("Please enter a new password");
        return;
      }

      if (resetType === "student" && selectedStudent) {
        await axios.put(`http://127.0.0.1:5000/admin/reset-student-password/${selectedStudent.student_id}`, {
          password: newPassword
        });
      } else if (resetType === "mentor" && selectedMentor) {
        await axios.put(`http://127.0.0.1:5000/admin/reset-mentor-password/${selectedMentor.mentor_id}`, {
          password: newPassword
        });
      }
      
      setShowResetPassword(false);
      setNewPassword("");
      fetchData();
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password. " + (err.response?.data?.message || ""));
    }
  };

  const containerStyle = {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto"
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "danger";
      case "In Progress": return "primary";
      case "Completed": return "success";
      default: return "warning";
    }
  };

  return (
    <div style={containerStyle}>
      <Sheet sx={{ p: 4, borderRadius: "md", mb: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Typography level="h3">Admin Dashboard</Typography>
          <Button color="danger" onClick={handleLogout}>Logout</Button>
        </div>
        
        {error && (
          <Box sx={{ p: 2, mb: 2, bgcolor: "danger.softBg", borderRadius: "md", color: "danger.plainColor" }}>
            {error}
          </Box>
        )}

        <Tabs
          value={tabIndex}
          onChange={(event, value) => setTabIndex(value)}
          sx={{ borderRadius: "md" }}
        >
          <TabList>
            <Tab>Students</Tab>
            <Tab>Mentors</Tab>
            <Tab>Projects</Tab>
          </TabList>
          
          <TabPanel value={0}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button color="primary" onClick={() => setShowAddStudent(true)}>
                Add New Student
              </Button>
            </Box>
            
            {loading ? (
              <Typography>Loading students...</Typography>
            ) : students.length === 0 ? (
              <Typography>No students found.</Typography>
            ) : (
              <Table sx={{ "& th": { fontWeight: "bold" } }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>PRN</th>
                    <th>Email</th>
                    <th>Mentor</th>
                    <th>GitHub</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id}>
                      <td>{student.student_id}</td>
                      <td>{student.name}</td>
                      <td>{student.prn}</td>
                      <td>{student.email}</td>
                      <td>{student.mentor_name || "Not Assigned"}</td>
                      <td>
                        {student.github_link ? (
                          <a href={student.github_link} target="_blank" rel="noopener noreferrer">
                            View GitHub
                          </a>
                        ) : (
                          "Not Provided"
                        )}
                      </td>
                      <td>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="sm" 
                            color="primary" 
                            onClick={() => openAssignMentor(student)}
                          >
                            Assign Mentor
                          </Button>
                          <Button 
                            size="sm" 
                            color="neutral" 
                            onClick={() => openResetPassword(student, "student")}
                          >
                            Reset Password
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            onClick={() => handleDeleteStudent(student.student_id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPanel>
          
          <TabPanel value={1}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button color="primary" onClick={() => setShowAddMentor(true)}>
                Add New Mentor
              </Button>
            </Box>
            
            {loading ? (
              <Typography>Loading mentors...</Typography>
            ) : mentors.length === 0 ? (
              <Typography>No mentors found.</Typography>
            ) : (
              <Table sx={{ "& th": { fontWeight: "bold" } }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor) => (
                    <tr key={mentor.mentor_id}>
                      <td>{mentor.mentor_id}</td>
                      <td>{mentor.name}</td>
                      <td>{mentor.email}</td>
                      <td>{mentor.department || "N/A"}</td>
                      <td>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="sm" 
                            color="neutral" 
                            onClick={() => openResetPassword(mentor, "mentor")}
                          >
                            Reset Password
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            onClick={() => handleDeleteMentor(mentor.mentor_id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPanel>
          
          <TabPanel value={2}>
            {loading ? (
              <Typography>Loading projects...</Typography>
            ) : projects.length === 0 ? (
              <Typography>No projects found.</Typography>
            ) : (
              <Table sx={{ "& th": { fontWeight: "bold" } }}>
                <thead>
                  <tr>
                    <th>Project ID</th>
                    <th>Title</th>
                    <th>Student</th>
                    <th>Mentor</th>
                    <th>Status</th>
                    <th>GitHub</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.project_id}</td>
                      <td>{project.title}</td>
                      <td>{project.student_name}</td>
                      <td>{project.mentor_name}</td>
                      <td>
                        <Chip color={getStatusColor(project.status)}>
                          {project.status}
                        </Chip>
                      </td>
                      <td>
                        {project.github_link ? (
                          <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                            View GitHub
                          </a>
                        ) : (
                          "Not Provided"
                        )}
                      </td>
                      <td>{new Date(project.last_updated).toLocaleDateString()}</td>
                      <td>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="sm" 
                            color="primary" 
                            onClick={() => openEditGithubLink(project)}
                          >
                            Edit GitHub
                          </Button>
                          <Button 
                            size="sm" 
                            color="danger" 
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPanel>
        </Tabs>
      </Sheet>
      
      {/* Add Student Modal */}
      <Modal open={showAddStudent} onClose={() => setShowAddStudent(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">Add New Student</Typography>
          <Divider sx={{ my: 2 }} />
          
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input 
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            />
          </FormControl>
          
          <FormControl required>
            <FormLabel>PRN</FormLabel>
            <Input 
              value={newStudent.prn}
              onChange={(e) => setNewStudent({...newStudent, prn: e.target.value})}
            />
          </FormControl>
          
          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
            />
          </FormControl>
          
          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password"
              value={newStudent.password}
              onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Mentor</FormLabel>
            <Select 
              placeholder="Select a mentor (optional)"
              value={newStudent.mentor_id}
              onChange={(e, value) => setNewStudent({...newStudent, mentor_id: value})}
            >
              {mentors.map((mentor) => (
                <Option key={mentor.mentor_id} value={mentor.mentor_id}>
                  {mentor.name} - {mentor.department}
                </Option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>GitHub Link (optional)</FormLabel>
            <Input 
              value={newStudent.github_link}
              onChange={(e) => setNewStudent({...newStudent, github_link: e.target.value})}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowAddStudent(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Add Mentor Modal */}
      <Modal open={showAddMentor} onClose={() => setShowAddMentor(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">Add New Mentor</Typography>
          <Divider sx={{ my: 2 }} />
          
          <FormControl required>
            <FormLabel>Name</FormLabel>
            <Input 
              value={newMentor.name}
              onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
            />
          </FormControl>
          
          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email"
              value={newMentor.email}
              onChange={(e) => setNewMentor({...newMentor, email: e.target.value})}
            />
          </FormControl>
          
          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input 
              type="password"
              value={newMentor.password}
              onChange={(e) => setNewMentor({...newMentor, password: e.target.value})}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Department</FormLabel>
            <Input 
              value={newMentor.department}
              onChange={(e) => setNewMentor({...newMentor, department: e.target.value})}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowAddMentor(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMentor}>Add Mentor</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Assign Mentor Modal */}
      <Modal open={showAssignMentor} onClose={() => setShowAssignMentor(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">Assign Mentor</Typography>
          <Divider sx={{ my: 2 }} />
          
          {selectedStudent && (
            <Typography level="body-md" sx={{ mb: 2 }}>
              Assigning mentor to: <strong>{selectedStudent.name}</strong>
            </Typography>
          )}
          
          <FormControl required>
            <FormLabel>Select Mentor</FormLabel>
            <Select 
              placeholder="Choose a mentor"
              value={selectedStudent?.mentor_id || ""}
              onChange={(e, value) => setSelectedStudent({...selectedStudent, mentor_id: value})}
            >
              {mentors.map((mentor) => (
                <Option key={mentor.mentor_id} value={mentor.mentor_id}>
                  {mentor.name} - {mentor.department}
                </Option>
              ))}
            </Select>
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowAssignMentor(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignMentor}>Assign</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Edit GitHub Link Modal */}
      <Modal open={showEditGithub} onClose={() => setShowEditGithub(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">Edit GitHub Link</Typography>
          <Divider sx={{ my: 2 }} />
          
          {selectedProject && (
            <Typography level="body-md" sx={{ mb: 2 }}>
              Editing GitHub link for project: <strong>{selectedProject.title}</strong>
            </Typography>
          )}
          
          <FormControl required>
            <FormLabel>GitHub Repository URL</FormLabel>
            <Input 
              placeholder="https://github.com/username/repository"
              value={newGithubLink}
              onChange={(e) => setNewGithubLink(e.target.value)}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowEditGithub(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateGithubLink}>Update Link</Button>
          </Stack>
        </ModalDialog>
      </Modal>
      
      {/* Reset Password Modal */}
      <Modal open={showResetPassword} onClose={() => setShowResetPassword(false)}>
        <ModalDialog sx={{ maxWidth: 500 }}>
          <Typography level="h4">Reset Password</Typography>
          <Divider sx={{ my: 2 }} />
          
          {resetType === "student" && selectedStudent && (
            <Typography level="body-md" sx={{ mb: 2 }}>
              Resetting password for student: <strong>{selectedStudent.name}</strong>
            </Typography>
          )}
          
          {resetType === "mentor" && selectedMentor && (
            <Typography level="body-md" sx={{ mb: 2 }}>
              Resetting password for mentor: <strong>{selectedMentor.name}</strong>
            </Typography>
          )}
          
          <FormControl required>
            <FormLabel>New Password</FormLabel>
            <Input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormControl>
          
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setShowResetPassword(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>Reset Password</Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </div>
  );
};

export default AdminPanel;
