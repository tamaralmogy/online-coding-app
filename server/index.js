const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Manually defined code blocks
const codeBlocks = [
  {
    id: 1,
    title: "Async case",
    code: 'async function foo() { return "bar"; }',
  },
  {
    id: 2,
    title: "Promise example",
    code: 'const promise = new Promise((resolve, reject) => { resolve("done"); });',
  },
  {
    id: 3,
    title: "Callback function",
    code: "function callbackExample(callback) { callback(); }",
  },
  {
    id: 4,
    title: "Fetch API",
    code: 'fetch("https://api.example.com").then(response => response.json()).then(data => console.log(data));',
  },
];

let mentorAssigned = null; // Track mentor assignment globally
let studentAssigned = null; // Track student assignment globally

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/code-blocks", (req, res) => {
  res.json(codeBlocks);
});

app.get("/code-blocks/:id", (req, res) => {
  const codeBlock = codeBlocks.find(
    (block) => block.id === parseInt(req.params.id)
  );
  if (codeBlock) {
    res.json(codeBlock);
  } else {
    res.status(404).send("Code block not found");
  }
});

io.on("connection", (socket) => {
  // Assign mentor and student when entering the lobby
  socket.on("enter lobby", () => {
    if (!mentorAssigned) {
      mentorAssigned = socket.id; // Assign the mentor by socket id
      socket.emit("role assigned", "mentor");
      console.log(`Mentor assigned: ${socket.id}`);
    } else if (!studentAssigned && mentorAssigned !== socket.id) {
      studentAssigned = socket.id; // Assign the student by socket id
      socket.emit("role assigned", "student");
      console.log(`Student assigned: ${socket.id}`);
    }
  });

  socket.on("code change", (data) => {
    io.emit("code update", data);
  });

  socket.on("disconnect", () => {
    if (mentorAssigned === socket.id) {
      console.log("Mentor disconnected");
      mentorAssigned = null; // Reset mentor assignment
      if (studentAssigned) {
        // Promote student to mentor
        mentorAssigned = studentAssigned;
        studentAssigned = null;
        io.to(mentorAssigned).emit("role assigned", "mentor");
      }
    } else if (studentAssigned === socket.id) {
      console.log("Student disconnected");
      studentAssigned = null; // Reset student assignment
    }
    console.log("Current mentor assignment:", mentorAssigned);
    console.log("Current student assignment:", studentAssigned);

    // Notify remaining clients of updated roles
    io.emit("role updated", {
      mentor: mentorAssigned,
      student: studentAssigned,
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
