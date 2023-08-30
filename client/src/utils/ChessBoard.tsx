import { Component, JSXElement } from "solid-js";
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
import w_knight from "../assets/knight_w.png";
import b_knight from "../assets/knight_b.png";
import { MovableCoords, NonMovableCoords, setMovableCoords, setNonMovableCoords } from "./sharedSignals";
import { Coordinates } from "./types";

interface tileProps {
  img: string | null;
  x: number;
  y: number;
  piece: Symbol | null;
}

export const PiecesEnum = {
  BPawn: Symbol("BPawn"),
  WPawn: Symbol("WPawn"),
  Bishop: Symbol("Bishop"),
  Rook: Symbol("Rook"),
  King: Symbol("King"),
  Queen: Symbol("Queen"),
  Knight: Symbol("Knight"),
};

const formPiece = (y: number, x: number): [string | null, Symbol | null] => {
  let img: string | null = null;
  let piece: Symbol | null = null;

  //Black pieces
  if (y == 1) {
    img = b_pawn;
    piece = PiecesEnum.BPawn;
  }
  if (y == 0) {
    if (x == 0 || x == 7) {
      img = b_rook;
      piece = PiecesEnum.Rook;
    }
    if (x == 1 || x == 6) {
      img = b_knight;
      piece = PiecesEnum.Knight;
    }
    if (x == 2 || x == 5) {
      img = b_bishop;
      piece = PiecesEnum.Bishop;
    }
    if (x == 3) {
      img = b_queen;
      piece = PiecesEnum.Queen;
    }
    if (x == 4) {
      img = b_king;
      piece = PiecesEnum.King;
    }
  }
  //

  //White pieces
  if (y == 6) {
    img = w_pawn;
    piece = PiecesEnum.WPawn;
  }
  if (y == 7) {
    if (x == 0 || x == 7) {
      img = w_rook;
      piece = PiecesEnum.Rook;
    }
    if (x == 1 || x == 6) {
      img = w_knight;
      piece = PiecesEnum.Knight;
    }
    if (x == 2 || x == 5) {
      img = w_bishop;
      piece = PiecesEnum.Bishop;
    }
    if (x == 3) {
      img = w_queen;
      piece = PiecesEnum.Queen;
    }
    if (x == 4) {
      img = w_king;
      piece = PiecesEnum.King;
    }
  }

  return [img, piece];
};

export const handleTileClick = (piece: Symbol, x: number, y: number) => {
  if (piece == PiecesEnum.BPawn) {
    setMovableCoords(AddMovableCoordinates(piece, x, y))
  }
};

export const AddMovableCoordinates = (piece:Symbol, x:number, y:number): Coordinates[] => {
  let coords:Coordinates[] = [];
  if (piece == PiecesEnum.BPawn) {
    coords.push({x: x, y: y+1})
    coords.push({x: x, y: y+2})
  }
  if(piece == PiecesEnum.WPawn) {
    coords.push({x: x, y: y-1})
    coords.push({x: x, y: y-2})
  }
  if (piece == PiecesEnum.Bishop) {
    for (let i = 0; i < 8; i++) {
      coords.push({x:x+i, y:y+i})
      coords.push({x:x+i, y:y-i})
      coords.push({x:x-i, y:y+i})
      coords.push({x:x-i, y:y-i})
    }
  }
  if (piece == PiecesEnum.Rook) {
    for (let i = 0; i < 8; i++) {
      coords.push({x: x, y: y+i})
      coords.push({x: x+i, y: y})
      coords.push({x: x, y: y-i})
      coords.push({x: x-i, y: y})
    }
  }
  if (piece == PiecesEnum.Knight) {
    coords.push({x:+1, y: y-2})
    coords.push({x:-1, y: y-2})
    coords.push({x:+2, y: y+1})
    coords.push({x:+2, y: y-1})
    coords.push({x:+1, y: y+2})
    coords.push({x:-1, y: y+2})
    coords.push({x:-2, y: y+1})
    coords.push({x:-2, y: y-1})
  }
  if(piece == PiecesEnum.Queen) {

  }

  return coords;
}

export const BlackTile: Component<tileProps> = (props: tileProps) => {
  if(props.piece != null) {
    NonMovableCoords().push({x:props.x, y:props.y})
  }
  return (
    <div class={style.BlackTile} onClick={() => console.log(props)}>
      {props.img == null ? null : <img src={props.img} alt="Chess Piece" />}
    </div>
  );
};

export const WhiteTile: Component<tileProps> = (props: tileProps) => {
  if(props.piece != null) {
    NonMovableCoords().push({x:props.x, y:props.y})
  }
  return (
    <div class={style.WhiteTile} onClick={() => console.log(props)}>
      {props.img == null ? null : <img src={props.img} alt="Chess Piece" />}
    </div>
  );
};

export class Chessboard {
  init() {
    const total: number = 8;
    const tileArray: JSXElement[] = [];

    for (let i = 0; i < total; i++) {
      for (let j = 0; j < total; j++) {
        //At the start, no pieces in the middle rows.
        let [img, piece] = formPiece(i, j);
        if ( (i + j) % 2 == 0) {
          tileArray.push(<WhiteTile x={j} y={i} img={img} piece={piece} />)
        } else {
          tileArray.push(<BlackTile x={j} y={i} img={img} piece={piece} />);
        }
      }
    }
    console.log(NonMovableCoords())
    return <div class={style.Board}>{tileArray}</div>;
  }
}
