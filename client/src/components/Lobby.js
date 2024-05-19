import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket"; // Import the singleton socket instance

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    fetch("/code-blocks")
      .then((response) => response.json())
      .then((data) => setCodeBlocks(data))
      .catch((err) => console.error("Error fetching code blocks:", err));

    // Notify server of entering lobby
    socket.emit("enter lobby");

    // Listen for role assignment
    socket.on("role assigned", (role) => {
      console.log("Assigned role:", role);
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("role assigned");
    };
  }, []);

  const handleClick = (id) => {
    navigate(`/code-block/${id}`);
  };

  return (
    <div>
      <h1>Choose code block</h1>
      <ul>
        {codeBlocks.map((block) => (
          <li key={block.id} onClick={() => handleClick(block.id)}>
            {block.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
