import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../styles/Controls.css";

const Controls = ({
  player,
  gameId,
  createGame,
  joinGame,
  copyIdToClipboard,
  copied,
  resetTrigger,
}) => {
  const [inputGameId, setInputGameId] = useState("");

  useEffect(() => {
    setInputGameId("");
  }, [resetTrigger]);

  return !player ? (
    <div className="controls">
      <button onClick={createGame} className="btn-create">
        Create New Game
      </button>
      <div>
        <input
          type="text"
          placeholder="Enter Game ID"
          value={inputGameId}
          onChange={(e) => setInputGameId(e.target.value)}
        />
        <button onClick={() => joinGame(inputGameId)} className="btn-join">
          Join Game
        </button>
      </div>
    </div>
  ) : (
    <div className="idText">
      <span>
        You're playing as {player}! Game ID: {gameId}
      </span>
      <button onClick={() => copyIdToClipboard(gameId)} className="btn-copy">
        {copied ? "Copied!" : "Copy ID"}
      </button>
    </div>
  );
};

Controls.propTypes = {
  player: PropTypes.string,
  gameId: PropTypes.string.isRequired,
  createGame: PropTypes.func.isRequired,
  joinGame: PropTypes.func.isRequired,
  copyIdToClipboard: PropTypes.func.isRequired,
  copied: PropTypes.bool.isRequired,
};

export default Controls;
