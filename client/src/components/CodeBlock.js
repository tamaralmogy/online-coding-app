import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import hljs from "highlight.js";
import "highlight.js/styles/default.css"; // Import the default style
import socket from "./socket"; // Import the singleton socket instance

const CodeBlock = () => {
  const { id } = useParams();
  const [codeBlock, setCodeBlock] = useState({ title: "", code: "" });
  const [role, setRole] = useState("");
  const codeRef = useRef(null); // Ref to the code block for highlighting

  const fetchCodeBlock = useCallback(() => {
    fetch(`/code-blocks/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setCodeBlock(data);
        console.log(`Fetched code block ${id}:`, data);
      })
      .catch((err) => {
        console.error(`Error fetching code block ${id}:`, err);
      });
  }, [id]);

  useEffect(() => {
    // Notify the server that the user has entered the lobby
    socket.emit("enter lobby");
    console.log("Emitted enter lobby event");

    // Listen for role assignment
    socket.on("role assigned", (assignedRole) => {
      console.log(`Role assigned for code block ${id}:`, assignedRole);
      setRole(assignedRole);
    });

    // Listen for code updates
    socket.on("code update", (data) => {
      if (data.id === parseInt(id)) {
        console.log(
          `Received code update for code block ${data.id}:`,
          data.code
        );
        setCodeBlock((prev) => ({ ...prev, code: data.code }));
      }
    });

    // Listen for role updates
    socket.on("role updated", ({ mentor, student }) => {
      console.log("Role updated:", { mentor, student });
      if (mentor === socket.id) {
        setRole("mentor");
      } else if (student === socket.id) {
        setRole("student");
      } else {
        setRole("");
      }
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("role assigned");
      socket.off("code update");
      socket.off("role updated");
    };
  }, [id]);

  useEffect(() => {
    if (role) {
      fetchCodeBlock();
    }
  }, [role, fetchCodeBlock]);

  useEffect(() => {
    if (codeRef.current && role === "mentor") {
      hljs.highlightBlock(codeRef.current); // Highlight the code block
    }
  }, [codeBlock.code, role]);

  const handleCodeChange = (e) => {
    if (role === "student") {
      const updatedCode = e.target.value;
      setCodeBlock((prev) => ({ ...prev, code: updatedCode }));
      console.log(`Student updating code block ${id}:`, updatedCode);
      socket.emit("code change", { id: parseInt(id), code: updatedCode });
    }
  };

  return (
    <div>
      <h1>{codeBlock.title}</h1>
      {role === "mentor" ? (
        <pre>
          <code className="javascript" ref={codeRef}>
            {codeBlock.code}
          </code>
        </pre>
      ) : (
        <textarea value={codeBlock.code} onChange={handleCodeChange} />
      )}
    </div>
  );
};

export default CodeBlock;
