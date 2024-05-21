import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config"; // Import the API URL

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]); // State to hold the list of code blocks

  useEffect(() => {
    // Fetch the list of code blocks from the server
    fetch(`${API_URL}/code-blocks`)
      .then((response) => response.json())
      .then((data) => setCodeBlocks(data)); // Set the fetched code blocks to the state
  }, []);

  // Handle click event to navigate to the selected code block
  const handleClick = (id) => {
    navigate(`/code-block/${id}`); // Navigate to the specific code block page
  };

  return (
    <div className="container">
      <h1>Welcome to the Online Coding App</h1>
      <h2>Choose a code block</h2>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li
            key={block.id}
            onClick={() => handleClick(block.id)} // Set up click handler for each code block
            className="code-block-item"
          >
            {block.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
