import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import "../styles/styles.css"; // Import the CSS file

const socket = io.connect("http://localhost:4000");

const CodeBlock = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook to handle navigation
  const [code, setCode] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [mentorAssigned, setMentorAssigned] = useState(false);
  const mentorCheckComplete = useRef(false);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    fetch(`/code-blocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCode(data.code);
        console.log(`Fetched code block ${id}:`, data.code);
        socket.emit("check mentor", id);
      });

    socket.on("code update", (data) => {
      console.log(`Code update for code block ${data.id}:`, data.code);
      setCode(data.code);
    });

    socket.on("mentor status", (status) => {
      if (!mentorCheckComplete.current) {
        console.log(`Received mentor status for code block ${id}:`, status);
        setIsMentor(status);
        setMentorAssigned(true);
        mentorCheckComplete.current = true;
      }
    });

    socket.on("code solved", (solved) => {
      console.log(`Received code solved status:`, solved);
      setIsSolved(solved);
    });

    return () => {
      socket.off("code update");
      socket.off("mentor status");
      socket.off("code solved");
    };
  }, [id]);

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
