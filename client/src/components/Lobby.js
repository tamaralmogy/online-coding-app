import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import "../styles/styles.css"; // Import the CSS file
=======
>>>>>>> 8bdca2de43b6dd217eb07ce1a6ba0e47172d5744

const Lobby = () => {
  const navigate = useNavigate();
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    fetch("/code-blocks")
<<<<<<< HEAD
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setCodeBlocks(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
=======
      .then((response) => response.json())
      .then((data) => setCodeBlocks(data));
>>>>>>> 8bdca2de43b6dd217eb07ce1a6ba0e47172d5744
  }, []);

  const handleClick = (id) => {
    navigate(`/code-block/${id}`);
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Display error message
  }

  return (
    <div className="container">
      <h1>Choose code block</h1>
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
