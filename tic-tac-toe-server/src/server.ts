import { WebSocketServer, WebSocket } from "ws";
import { connectToDatabase, saveGameToDatabase } from "./utils/dbConnection";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket server running on ws://localhost:${PORT}`);

type Game = {
  X: WebSocket | null;
  O: WebSocket | null;
  moves: Array<any>;
  currentTurn: "X" | "O";
  gameStatus: string;
};

const games = new Map<string, Game>();

connectToDatabase();

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    const { type, gameId, move } = message;

    console.log("Received message:", message);

    switch (type) {
      case "join":
        handleJoinGame(ws, gameId);
        break;
      case "move":
        handlePlayerMove(gameId, move, ws);
        break;
      case "reset":
        handleResetGame(gameId);
        break;
      default:
        console.log("Unknown message type:", type);
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    handleClientDisconnect(ws);
  });
});

function handleJoinGame(ws: WebSocket, gameId: string) {
  let game = games.get(gameId);

  if (!game) {
    game = { X: null, O: null, moves: [], currentTurn: "X", gameStatus: "started" };
    games.set(gameId, game);
  }

  if (!game.X) {
    game.X = ws;
    ws.send(JSON.stringify({ type: "player_assignment", player: "X", gameId }));
    console.log(`Player X joined game ${gameId}`);
  } else if (!game.O) {
    game.O = ws;
    ws.send(JSON.stringify({ type: "player_assignment", player: "O", gameId }));
    console.log(`Player O joined game ${gameId}`);
  } else {
    ws.send(JSON.stringify({ type: "error", message: "Game is full" }));
    console.log(`Game ${gameId} is full`);
    return;
  }

  if (game.X && game.O) {
    broadcastToGame(gameId, { type: "start", message: "Game started! Player X's turn." });
  }
}

function handlePlayerMove(gameId: string, move: any, ws: WebSocket) {
  const game = games.get(gameId);

  if (!game) {
    ws.send(JSON.stringify({ type: "error", message: "Invalid game ID" }));
    return;
  }

  const player = ws === game.X ? "X" : ws === game.O ? "O" : null;

  if (!player) {
    ws.send(JSON.stringify({ type: "error", message: "You are not part of this game" }));
    return;
  }

  if (game.currentTurn !== player) {
    ws.send(JSON.stringify({ type: "error", message: `It's not your turn. Current turn: ${game.currentTurn}` }));
    return;
  }

  game.moves.push({ player, position: move });
  game.currentTurn = player === "X" ? "O" : "X";
  broadcastToGame(gameId, { type: "move", player, position: move });

  const winner = checkWinner(game.moves);
  if (winner) {
    broadcastToGame(gameId, { type: "end", winner });
    saveGameToDatabase(gameId, winner, game.moves);
    game.gameStatus = "ended";
  } else if (game.moves.length === 9) {
    broadcastToGame(gameId, { type: "end", winner: "draw" });
    saveGameToDatabase(gameId, "draw", game.moves);
    game.gameStatus = "ended";
  } else {
    broadcastToGame(gameId, { type: "turn", currentTurn: game.currentTurn });
  }
}

function handleResetGame(gameId: string) {
  const game = games.get(gameId);

  if (!game) return;

  game.moves = [];
  game.currentTurn = "X";
  game.gameStatus = "started";

  broadcastToGame(gameId, { type: "resetGame", message: "Game has been reset!" });
}

function broadcastToGame(gameId: string, message: any) {
  const game = games.get(gameId);
  if (!game) return;

  [game.X, game.O].forEach((client) => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  if (game.gameStatus === "ended") {
    games.delete(gameId);
    console.log(`Game ${gameId} removed`);
  }
}

function checkWinner(moves: any[]) {
  const board = Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));

  moves.forEach(({ player, position }) => {
    board[position[0]][position[1]] = player;
  });

  const winningCombos = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];

  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
      return board[a[0]][a[1]];
    }
  }

  return null;
}

function handleClientDisconnect(ws: WebSocket) {
  for (const [gameId, game] of games.entries()) {
    if (game.X === ws) {
      game.X = null;
      broadcastToGame(gameId, { type: "disconnect", player: "X" });
    } else if (game.O === ws) {
      game.O = null;
      broadcastToGame(gameId, { type: "disconnect", player: "O" });
    }

    if (!game.X && !game.O) {
      games.delete(gameId);
      console.log(`Game ${gameId} removed`);
    }
  }
}
