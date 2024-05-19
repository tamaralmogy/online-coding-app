import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

const socket = io.connect("http://localhost:4000");

const CodeBlock = () => {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [mentorAssigned, setMentorAssigned] = useState(false);
  const mentorCheckComplete = useRef(false); // Ref to keep track of mentor check completion

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
        // Set mentor status only once
        console.log(`Received mentor status for code block ${id}:`, status);
        setIsMentor(status);
        setMentorAssigned(true);
        mentorCheckComplete.current = true; // Mark mentor check as complete
      }
    });

    return () => {
      socket.off("code update");
      socket.off("mentor status");
    };
  }, [id]);

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

  return (
    <div>
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
