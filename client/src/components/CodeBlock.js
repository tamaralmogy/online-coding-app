import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import "../styles/styles.css"; // Import the CSS file

const socket = io.connect("http://localhost:4000");

const CodeBlock = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [mentorAssigned, setMentorAssigned] = useState(false);

  useEffect(() => {
    fetch(`/code-blocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCode(data.code);
        console.log(`Fetched code block ${id}:`, data.code);
        // Check mentor status
        socket.emit("check mentor");
      });

    // Listen for code updates
    socket.on("code update", (data) => {
      console.log(`Code update for code block ${data.id}:`, data.code);
      setCode(data.code);
    });

    // Listen for mentor status
    socket.on("mentor status", (status) => {
      console.log(`Received mentor status for code block ${id}:`, status);
      setIsMentor(status);
      setMentorAssigned(true);
      console.log(`isMentor: ${status}, mentorAssigned: true`);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("code update");
      socket.off("mentor status");
    };
  }, [id]); // Re-run effect when code block ID changes

  const handleCodeChange = (e) => {
    if (!isMentor) {
      const updatedCode = e.target.value;
      setCode(updatedCode);
      console.log(`Student updating code block ${id}:`, updatedCode);
      socket.emit("code change", { id, code: updatedCode });
    }
  };

  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  // Additional logging for debugging
  console.log(`Rendering CodeBlock for id: ${id}`);
  console.log(`isMentor: ${isMentor}, mentorAssigned: ${mentorAssigned}`);

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
    </div>
  );
};

export default CodeBlock;
