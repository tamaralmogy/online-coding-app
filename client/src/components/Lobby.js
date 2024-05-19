import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
