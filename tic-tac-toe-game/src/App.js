import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import Controls from "./components/Controls";
import { v4 as uuidv4 } from "uuid";
import "./styles/App.css";

const App = () => {
  //#region State variables
  const [ws, setWs] = useState(null);
  const [player, setPlayer] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("X");
  const [messages, setMessages] = useState([]);
  const [gameId, setGameId] = useState("");
  const [board, setBoard] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(null))
  );
  const [roundEnd, setRoundEnd] = useState(false);
  const [startRound, setStartRound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  //#endregion

  //#region WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(
      "ws://localhost:8080"
    );
    setWs(socket);

    socket.onmessage = (event) =>
      handleWebSocketMessage(JSON.parse(event.data));

    socket.onerror = (error) => console.error("WebSocket error:", error);

    return () => socket.close();
  }, []);
  //#endregion

  //#region Functions to handle websocket messages
  const handleWebSocketMessage = (message) => {
    console.log("Received message:", message);

    switch (message.type) {
      case "player_assignment":
        setPlayer(message.player);
        setGameId(message.gameId);
        break;
      case "start":
        gameStarted();
        addMessage(message.message);
        break;
      case "move":
        updateBoard(message.player, message.position);
        break;
      case "turn":
        setCurrentTurn(message.currentTurn);
        addMessage(`It's ${message.currentTurn}'s turn.`);
        break;
      case "end":
        endedGame();
        addMessage(`Game Over! Winner: ${message.winner}`);
        break;
      case "resetGame":
        resetGame();
        addMessage(message.message);
        break;
      case "disconnect":
        addMessage(`${message.player} disconnected.`);
        break;
      default:
        addMessage("Unknown message type.");
    }
  };

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const gameStarted = () => {
    setRoundEnd(false);
    setStartRound(true);
  };

  const endedGame = () => {
    setRoundEnd(true);
    setStartRound(false);
  };

  const createGame = () => {
    const newGameId = uuidv4();
    setGameId(newGameId);
    ws &&
      ws.readyState === WebSocket.OPEN &&
      ws.send(JSON.stringify({ type: "join", gameId: newGameId }));
    resetGame();
  };

  const joinGame = (inputGameId) => {
    setGameId(inputGameId);
    ws &&
      ws.readyState === WebSocket.OPEN &&
      ws.send(JSON.stringify({ type: "join", gameId: inputGameId }));
    resetGame();
  };

  const makeMove = (row, col) => {
    if (player && currentTurn === player) {
      ws &&
        ws.readyState === WebSocket.OPEN &&
        ws.send(JSON.stringify({ type: "move", gameId, move: [row, col] }));
    } else {
      console.error("Not your turn!");
    }
  };

  const updateBoard = (player, [row, col]) => {
    setBoard((prevBoard) => {
      const newBoard = [...prevBoard.map((row) => [...row])];
      newBoard[row][col] = player;
      return newBoard;
    });
  };
  //#endregion

  //#region Functions to allow user to reset game and copy game ID
  const copyIdToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => setCopied(true))
      .catch(() => console.error("Failed to copy Game ID."));
  };

  const resetGame = () => {
    resetGameState();
    setResetTrigger(!resetTrigger);
    ws &&
      ws.readyState === WebSocket.OPEN &&
      ws.send(JSON.stringify({ type: "reset", gameId }));
  };

  const resetGameState = () => {
    setBoard(
      Array(3)
        .fill(null)
        .map(() => Array(3).fill(null))
    );
    setCopied(false);
    setMessages([]);
    setCurrentTurn("X");
    setRoundEnd(false);
    setStartRound(false);
    setPlayer(null);
  };

  //#endregion

  return (
    <div className="container">
      <h1>Tic-Tac-Toe</h1>
      <Controls
        player={player}
        gameId={gameId}
        createGame={createGame}
        joinGame={joinGame}
        copyIdToClipboard={copyIdToClipboard}
        copied={copied}
        resetTrigger={resetTrigger}
      />
      {roundEnd ? (
        <p>{messages[messages.length - 1]}</p>
      ) : (
        <>{startRound ? `Player ${currentTurn}'s turn` : null}</>
      )}
      <Board board={board} makeMove={makeMove} />
      {roundEnd ? (
        <button onClick={resetGame} className="btn-reset">
          Reset Game
        </button>
      ) : null}
    </div>
  );
};

export default App;
