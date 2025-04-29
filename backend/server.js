const express = require("express");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
const messageRoutes = require("./routes/messageRoutes");
const {dbConnection} = require('./config/db');


const app = express();

dbConnection();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use("/student", studentRoutes);
app.use("/faculty", facultyRoutes);
app.use("/admin", adminRoutes);
app.use("/projects", projectRoutes);
app.use("/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
