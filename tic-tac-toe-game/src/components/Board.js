import React from "react";
import PropTypes from "prop-types";
import "../styles/Board.css";

const Board = ({ board, makeMove }) => (
  <div className="board">
    {board.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className="cell"
          onClick={() => makeMove(rowIndex, colIndex)}
          style={{ backgroundColor: cell ? "#ddd" : "#fff" }}
        >
          {cell}
        </div>
      ))
    )}
  </div>
);

Board.propTypes = {
  board: PropTypes.arrayOf(PropTypes.array).isRequired,
  makeMove: PropTypes.func.isRequired,
};

export default Board;
