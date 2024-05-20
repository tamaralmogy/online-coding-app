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

// Dynamically generate the solution for each code block
codeBlocks.forEach((block) => {
  block.solution = `${block.code} thank you ChatGPT!`;
});

let mentorId = null; // Global mentor ID
let students = new Set(); // Set to store student IDs

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
  console.log("New client connected");
  console.log("Current mentor ID:", mentorId);

  if (!mentorId) {
    mentorId = socket.id;
    socket.emit("mentor status", true);
    console.log(`Mentor assigned: ${socket.id}`);
  } else {
    socket.emit("mentor status", false);
    students.add(socket.id); // Add to students set
  }

  socket.on("check mentor", (id) => {
    console.log(`Client checking mentor status for code block ${id}`);
    socket.emit("mentor status", mentorId === socket.id);
  });

  socket.on("code change", (data) => {
    console.log(`Code change for code block ${data.id}:`, data.code);

    // Log the entire data object to verify its structure and values
    console.log("Received data object:", data);

    const codeBlock = codeBlocks.find(
      (block) => block.id === parseInt(data.id)
    );
    if (codeBlock) {
      console.log(`Current code for block ${data.id}: ${codeBlock.code}`);
      console.log(`Solution for block ${data.id}: ${codeBlock.solution}`);
    }

    io.emit("code update", data);

    if (
      parseInt(data.id) === codeBlock.id &&
      data.code.trim() === codeBlock.solution.trim()
    ) {
      io.to(socket.id).emit("code solved", true);
      console.log(`Code block ${data.id} solved by ${socket.id}`);
    } else {
      io.to(socket.id).emit("code solved", false);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    students.delete(socket.id); // Remove from students set
    if (mentorId === socket.id) {
      mentorId = null; // Reset mentor ID
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
