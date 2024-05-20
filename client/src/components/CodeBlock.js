import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

// optional remove
// const socket = io.connect("http://localhost:4000");
const socket = io.connect("https://warm-mesa-50121-a03e03717a65.herokuapp.com");

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isMentor, setIsMentor] = useState(false); // State to determine if the user is a mentor
  const [mentorAssigned, setMentorAssigned] = useState(false); // State to check if mentor assignment is complete
  const mentorCheckComplete = useRef(false); // Ref to avoid rechecking mentor status
  const [isSolved, setIsSolved] = useState(false); // State to check if the code block is solved

  useEffect(() => {
    // Fetch the code block data from the server
    fetch(`/code-blocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCode(data.code);
        console.log(`Fetched code block ${id}:`, data.code);
        socket.emit("check mentor", id);
      });
    // Listen for code updates from the server
    socket.on("code update", (data) => {
      console.log(`Code update for code block ${data.id}:`, data.code);
      setCode(data.code);
    });
    // Listen for mentor status from the server
    socket.on("mentor status", (status) => {
      if (!mentorCheckComplete.current) {
        console.log(`Received mentor status for code block ${id}:`, status);
        setIsMentor(status);
        setMentorAssigned(true); // Mark mentor check as complete
        mentorCheckComplete.current = true;
      }
    });
    // Listen for code solved status from the server
    socket.on("code solved", (solved) => {
      console.log(`Received code solved status:`, solved);
      setIsSolved(solved); // Set the solved status
    });
    // Cleanup on component unmount
    return () => {
      socket.off("code update");
      socket.off("mentor status");
      socket.off("code solved");
    };
  }, [id]);
  // Handle code changes in the textarea
  const handleCodeChange = (e) => {
    if (!isMentor) {
      const updatedCode = e.target.value;
      setCode(updatedCode);
      console.log(`Student updating code block ${id}:`, updatedCode);
      socket.emit("code change", { id, code: updatedCode });
    } else {
      console.log(`Mentor cannot edit code block ${id}`);
    }
  };

  const handleReturn = () => {
    navigate("/"); // Navigate back to the lobby
  };

  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  return (
    <div className="container">
      <h1>Code Block</h1>
      {mentorAssigned ? (
        isMentor ? (
          <pre>
            <code className="javascript">{code}</code>
          </pre>
        ) : (
          <textarea value={code} onChange={handleCodeChange} />
        )
      ) : (
        <p>Loading...</p>
      )}
      {isSolved && (
        <div className="smiley-face">
          <span role="img" aria-label="Smiley face">
            😊
          </span>
        </div>
      )}
      <button onClick={handleReturn} className="return-button">
        Return to Lobby
      </button>
    </div>
  );
};

export default CodeBlock;
