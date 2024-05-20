import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css"; // Import the CSS file from the styles folder

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);

  useEffect(() => {
    fetch("/code-blocks")
      .then((response) => response.json())
      .then((data) => setCodeBlocks(data));
  }, []);

  const handleClick = (id) => {
    navigate(`/code-block/${id}`);
  };

  return (
    <div className="container">
      <h1>Welcome to the Online Coding App</h1>
      <h2>Choose a code block</h2>
      <ul className="code-block-list">
        {codeBlocks.map((block) => (
          <li
            key={block.id}
            onClick={() => handleClick(block.id)}
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
