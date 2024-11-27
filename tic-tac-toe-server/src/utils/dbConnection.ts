import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectToDatabase = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
  }
  
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const gameSchema = new mongoose.Schema({
  gameId: String,
  players: { X: String, O: String },
  moves: Array,
  winner: String,
  timestamp: Date,
});

export const GameModel = mongoose.model("Game", gameSchema);

export const saveGameToDatabase = async (
  gameId: string,
  winner: string,
  moves: any[]
) => {
  const gameData = {
    gameId,
    players: { X: "Player X", O: "Player O" },
    moves,
    winner,
    timestamp: new Date(),
  };

  try {
    const game = new GameModel(gameData);
    await game.save();
    console.log("Game saved to database:", gameData);
  } catch (error) {
    console.error("Error saving game to database:", error);
  }
};
