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

// Predefined code blocks for exercises
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

let mentorId = null; // Stores the mentor's socket ID
let students = new Set(); // Stores student socket IDs

// Middleware to log requests and set no-cache header
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  console.log(`${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

// Endpoint to get all code blocks
app.get("/code-blocks", (req, res) => {
  res.json(codeBlocks);
});

// Endpoint to get a specific code block by ID
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

// Fallback to serve React's index.html for all unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  // Assign mentor if no mentor exists
  if (!mentorId) {
    mentorId = socket.id;
    socket.emit("mentor status", true);
    console.log(`Mentor assigned: ${socket.id}`);
  } else {
    socket.emit("mentor status", false);
    students.add(socket.id); // Add to students set
  }

  // Handle mentor status check
  socket.on("check mentor", (id) => {
    socket.emit("mentor status", mentorId === socket.id);
  });

  // Handle code change events
  socket.on("code change", (data) => {
    const codeBlock = codeBlocks.find(
      (block) => block.id === parseInt(data.id)
    );
    if (codeBlock) {
      io.emit("code update", data); // Broadcast code update to all clients

      // Check if the submitted code matches the solution
      if (data.code.trim() === codeBlock.solution.trim()) {
        io.to(socket.id).emit("code solved", true);
        console.log(`Code block ${data.id} solved by ${socket.id}`);
      } else {
        io.to(socket.id).emit("code solved", false);
      }
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    students.delete(socket.id); // Remove from students set
    if (mentorId === socket.id) {
      mentorId = null; // Reset mentor ID if mentor disconnects
      console.log("Mentor has disconnected");
    }
  });

  // Handle mentor request
  socket.on("request mentor", () => {
    if (!mentorId && !students.has(socket.id)) {
      mentorId = socket.id;
      socket.emit("mentor status", true);
      console.log(`New mentor assigned: ${mentorId}`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
