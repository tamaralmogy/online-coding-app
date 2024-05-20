# Online Coding App

This is an online coding web application designed to facilitate real-time coding and collaboration between mentors and students.

## Features

- Real-time code editing with WebSockets
- Mentor and student roles with specific permissions
- Predefined code blocks for various coding exercises
- Solution checking with visual feedback (e.g., smiley face when the solution is correct)
- Easy navigation between code blocks and lobby
- Return to lobby button for easy navigation
- 
## User Roles

### Mentor and Student Roles

- **Mentor**: The first user entering the lobby is designated as the mentor.
- **Student**: Every other user will be defined as a student.
- A student remains a student for the duration of the session.
- When the mentor leaves, the next user who joins will take the mentor's place.

## Getting Started

### Prerequisites

Make sure you have the following software installed on your machine:

- [Node.js](https://nodejs.org/en/) (includes npm)

### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/tamaralmogy/online-coding-app.git
   cd online-coding-app
   npm install
   npm start
   
### Project Structure
- `public/`: Contains static files and the `index.html`.
- `src/`: Contains the React components and application logic.
  - `components/`: Contains React components like `CodeBlock` and `Lobby`.
  - `styles/`: Contains CSS files for styling.
  - `index.js`: Entry point for the React application.
- `server/`: Contains the server-side code.
  - `index.js`: Main server file that sets up the Express server and WebSocket connections.

   
   
