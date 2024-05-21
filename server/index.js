const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../client/.env") });

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

// Add solution to each code block for validation purposes
codeBlocks.forEach((block) => {
  block.solution = `${block.code} thank you ChatGPT!`;
});

let mentorId = null;
let students = new Set();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  console.log(`${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

app.use(express.static(path.join(__dirname, "../client/build")));

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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

io.on("connection", (socket) => {
  console.log("New client connected");

  if (!mentorId) {
    mentorId = socket.id;
    socket.emit("mentor status", true);
    console.log(`Mentor assigned: ${socket.id}`);
  } else {
    socket.emit("mentor status", false);
    students.add(socket.id);
  }

  socket.on("check mentor", (id) => {
    socket.emit("mentor status", mentorId === socket.id);
  });

  socket.on("code change", (data) => {
    const codeBlock = codeBlocks.find(
      (block) => block.id === parseInt(data.id)
    );
    if (codeBlock) {
      io.emit("code update", data);

      if (data.code.trim() === codeBlock.solution.trim()) {
        io.to(socket.id).emit("code solved", true);
        console.log(`Code block ${data.id} solved by ${socket.id}`);
      } else {
        io.to(socket.id).emit("code solved", false);
      }
    }
  });

  socket.on("disconnect", () => {
    students.delete(socket.id);
    if (mentorId === socket.id) {
      mentorId = null;
      console.log("Mentor has disconnected");
    }
  });

  socket.on("request mentor", () => {
    if (!mentorId && !students.has(socket.id)) {
      mentorId = socket.id;
      socket.emit("mentor status", true);
      console.log(`New mentor assigned: ${mentorId}`);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
