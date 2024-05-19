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

<<<<<<< HEAD
// Variable to store the global mentor socket ID
let globalMentorId = null;
=======
let mentorAssigned = {};
>>>>>>> 8bdca2de43b6dd217eb07ce1a6ba0e47172d5744

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  console.log(`${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/code-blocks", (req, res) => {
  console.log("GET /code-blocks");
  res.json(codeBlocks);
});

app.get("/code-blocks/:id", (req, res) => {
  console.log(`GET /code-blocks/${req.params.id}`);
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
<<<<<<< HEAD
  console.log("New client connected:", socket.id);

  socket.on("check mentor", () => {
    console.log(`Client checking mentor status`);
    if (!globalMentorId) {
      globalMentorId = socket.id; // Assign the client as the global mentor
      socket.emit("mentor status", true);
      console.log(`Mentor assigned:`, socket.id);
    } else {
      socket.emit("mentor status", false);
    }
    console.log("Current global mentor:", globalMentorId);
=======
  console.log("New client connected");
  console.log("Current mentor assignments:", mentorAssigned);

  socket.on("check mentor", (id) => {
    console.log(`Client checking mentor status for code block ${id}`);
    if (!mentorAssigned[id]) {
      mentorAssigned[id] = socket.id; // Assign the mentor by socket id
      socket.emit("mentor status", true);
      console.log(`Mentor assigned for code block ${id}:`, socket.id);
    } else {
      socket.emit("mentor status", false);
    }
    console.log("Updated mentor assignments:", mentorAssigned);
>>>>>>> 8bdca2de43b6dd217eb07ce1a6ba0e47172d5744
  });

  socket.on("code change", (data) => {
    console.log(`Code change for code block ${data.id}:`, data.code);
    io.emit("code update", data);
  });

  socket.on("disconnect", () => {
<<<<<<< HEAD
    console.log("Client disconnected:", socket.id);
    if (globalMentorId === socket.id) {
      console.log(`Mentor disconnected:`, socket.id);
      globalMentorId = null; // Remove global mentor assignment
    }
    console.log("Current global mentor after disconnect:", globalMentorId);
=======
    console.log("Client disconnected");
    // Check if the disconnected client was the mentor
    for (const key in mentorAssigned) {
      if (mentorAssigned[key] === socket.id) {
        console.log(`Mentor disconnected from code block ${key}`);
        delete mentorAssigned[key]; // Remove mentor assignment
        break;
      }
    }
    console.log("Updated mentor assignments after disconnect:", mentorAssigned);
>>>>>>> 8bdca2de43b6dd217eb07ce1a6ba0e47172d5744
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
