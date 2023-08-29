import { Component, For } from "solid-js";
import style from "../styles/ChessBoard.module.css";
import w_pawn from "../assets/pawn_w.png";
import b_pawn from "../assets/pawn_b.png";
import w_bishop from "../assets/bishop_w.png";
import b_bishop from "../assets/bishop_b.png";
import w_king from "../assets/knight_w.png";
import b_king from "../assets/knight_b.png";
import w_queen from "../assets/queen_w.png";
import b_queen from "../assets/queen_b.png";
import w_rook from "../assets/rook_w.png";
import b_rook from "../assets/rook_b.png";
import { pawn } from "../three/pawn";

interface tileProps {
  piece?: string | null;
}

type Tile = {
    piece?: string | null,
    element: Component
}

export const MakeChess: Component = () => {
  const total: number = 8;
  const tileArray: Tile[] = [];

  for (let i = 0; i < total; i++) {
    let piece: string | null = null;
    for (let j = 0; j < total; j++) {
      (i + j) % 2 == 0 ? tileArray.push({piece, element: WhiteTile}) : tileArray.push({piece, element: BlackTile});
    }
  }

  return (
    <div class={style.Board}>
      <For each={tileArray}>{(Tile) => <Tile.element />}</For>
    </div>
  );
};

export const BlackTile: Component<tileProps> = ({ piece }) => {
  return (
    <div class={style.BlackTile}>
      {piece == null ? null : <img src={piece} alt="Chess Piece" />}
    </div>
  );
};

export const WhiteTile: Component<tileProps> = ({ piece }) => {
  return (
    <div class={style.WhiteTile}>
      {piece == null ? null : <img src={piece} alt="Chess Piece" />}
    </div>
  );
};

export class Chessboard {
  init() {
    const total: number = 8;
    const tileArray:Tile[] = [];

    for (let i = 0; i < total; i++) {
        let piece: string | null = null;
      for (let j = 0; j < total; j++) {
        //At the start, no pieces in the middle rows.
        (i + j) % 2 == 0
          ? tileArray.push({piece, element: WhiteTile})
          : tileArray.push({piece, element: BlackTile});
      }
    }

    return (
      <div class={style.Board}>
        <For each={tileArray}>{(Tile) => <Tile.element />}</For>
      </div>
    );
  }

  movement() {}
}
