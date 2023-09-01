import { Component, JSXElement } from "solid-js";
import style from "../styles/ChessBoard.module.css";
import w_pawn from "../assets/pawn_w.png";
import b_pawn from "../assets/pawn_b.png";
import w_bishop from "../assets/bishop_w.png";
import b_bishop from "../assets/bishop_b.png";
import w_king from "../assets/king_w.png";
import b_king from "../assets/king_b.png";
import w_queen from "../assets/queen_w.png";
import b_queen from "../assets/queen_b.png";
import w_rook from "../assets/rook_w.png";
import b_rook from "../assets/rook_b.png";
import w_knight from "../assets/knight_w.png";
import b_knight from "../assets/knight_b.png";
import {
  AllCoords,
  AllPieces,
  FirstClick,
  MovableCoords,
  MovableCoordsMap,
  MovableTiles,
/*   NonMovableCoords, */
  NonMovableCoordsMap,
  SelectedTileImg,
  SelectedTileX,
  SelectedTileY,
  TileArray,
  setFirstClick,
  setMovableCoords,
  setMovableTiles,
  setNonMovableCoords,
  setSelectedTileImg,
  setSelectedTilePiece,
  setSelectedTileX,
  setSelectedTileY,
} from "./sharedSignals";
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

export const handleTileClick = (piece: Symbol | null, x: number, y: number, img:string | null) => {
  if (piece != null) {
    setFirstClick(true)
    if (FirstClick()) {
      setMovableCoords(AddMovableCoordinates(piece, x, y));
      updateTiles();
      setSelectedTileX(x)
      setSelectedTileY(y)
      setSelectedTilePiece(piece);
      setSelectedTileImg(img!)
    }
  } else {
    if(FirstClick()) {
      if(MovableCoordsMap().has(`${x}${y}`)) {
        makeMovement(piece, x, y, img!)
        MovableCoordsMap().delete(`${x}${y}`)
        MovableCoordsMap().set(`${SelectedTileX()}${SelectedTileY()}`, true)
        AddMovableCoordinates(piece, x, y)
      }
      setFirstClick(false);
      setMovableCoords([])
      updateTiles()
      setSelectedTilePiece(undefined)
      setSelectedTileX(undefined)
      setSelectedTileY(undefined)
      setSelectedTileImg(undefined)
    }
  }
  console.log({piece, x, y, img});
  console.log(MovableCoords())
  console.log(MovableTiles())
  console.log(NonMovableCoordsMap())
  console.log(MovableCoordsMap())
};

export const makeMovement = (piece: Symbol | null, x:number, y:number, img:string) => {
  let currentTile = document.getElementById(`${SelectedTileX()}${SelectedTileY()}`)
  let newTile = document.getElementById(`${x}${y}`);

  let image = document.createElement("img")
  image.src = SelectedTileImg()!;
  image.id = `${x}${y}_img`

  let currentTileImage = document.getElementById(`${SelectedTileX()}${SelectedTileY()}_img`)

  newTile?.appendChild(image)
  currentTile?.removeChild(currentTileImage!)
}

export const updateTiles = () => {
  MovableTiles()?.forEach((tile) =>
    tile.setAttribute("style", "border: 2px solid transparent")
  );

  setMovableTiles([]);

  for (let i = 0; i < MovableCoords().length; i++) {
    MovableTiles()!.push(
      document.getElementById(`${MovableCoords()[i].x}${MovableCoords()[i].y}`)!
    );
    MovableTiles()![i].setAttribute("style", "border: 2px solid white");
  }
};

export const AddMovableCoordinates = (
  piece: Symbol | null,
  x: number,
  y: number
): Coordinates[] => {
  MovableCoordsMap().clear();
  let coords: Coordinates[] = [];
  if (piece == PiecesEnum.BPawn) {
    for (let i = 1; i <= 2; i++) {
      if (NonMovableCoordsMap().get(`${x}${y+i}`)) {
        break;
      }
      coords.push({ x: x, y: y + i });
    }
  }
  if (piece == PiecesEnum.WPawn) {
    for (let i = 1; i <= 2; i++) {
      if (NonMovableCoordsMap().get(`${x}${y-i}`)) {
        break;
      }
      coords.push({ x: x, y: y - i });
    }
  }
  if (piece == PiecesEnum.Bishop) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y+i}`)) {
        break;
      }
      coords.push({ x: x+i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y-i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y-i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y+i}`)) {
        break;
      }
      coords.push({ x: x-i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y-i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y-i });
    }
  }
  if (piece == PiecesEnum.Rook) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y+i}`)) {
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y}`)) {
        break;
      }
      coords.push({ x: x + i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y-i}`)) {
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y}`)) {
        break;
      }
      coords.push({ x: x - i, y: y });
    }
  }
  if (piece == PiecesEnum.Knight) {
    const test:Coordinates[] = []
    coords.push({ x: x + 2, y: y + 1 });
    coords.push({ x: x + 1, y: y - 2 });
    coords.push({ x: x - 1, y: y - 2 });
    coords.push({ x: x + 2, y: y - 1 });
    coords.push({ x: x + 1, y: y + 2 });
    coords.push({ x: x - 1, y: y + 2 });
    coords.push({ x: x - 2, y: y + 1 });
    coords.push({ x: x - 2, y: y - 1 });
    coords.forEach(coord => {
      if(!NonMovableCoordsMap().get(`${coord.x}${coord.y}`)) {
        test.push(coord);
      }
    })
    coords = test;
  }
  if (piece == PiecesEnum.Queen) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y+i}`)) {
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y-i}`)) {
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y}`)) {
        break;
      }
      coords.push({ x: x+i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y}`)) {
        break;
      }
      coords.push({ x: x - i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y+i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x+i}${y-i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y+i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x-i}${y-i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y - i });
    }
  }
  if (piece == PiecesEnum.King) {
    const test:Coordinates[] = [];
    coords.push({ x: x, y: y + 1 });
    coords.push({ x: x, y: y - 1 });
    coords.push({ x: x + 1, y: y });
    coords.push({ x: x - 1, y: y });
    coords.push({ x: x + 1, y: y + 1 });
    coords.push({ x: x + 1, y: y - 1 });
    coords.push({ x: x - 1, y: y + 1 });
    coords.push({ x: x - 1, y: y - 1 });
    coords.forEach(coord => {
      if(!NonMovableCoordsMap().get(`${coord.x}${coord.y}`)) {
        test.push(coord);
      }
    })
    coords = test;
  }
  let result = coords.filter(
    (coord) => coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8
  );

  result.forEach(coord => {
    MovableCoordsMap().set(`${coord.x}${coord.y}`, true);
  })

  return result;
};

export const BlackTile: Component<tileProps> = (props: tileProps) => {
  if (props.piece) {
    NonMovableCoordsMap().set(`${props.x}${props.y}`, true);
  }
  const id = `${props.x}${props.y}`;
  const id_image = `${id}_img`;
  return (
    <div
      class={style.BlackTile}
      onClick={() => handleTileClick(props.piece, props.x, props.y, props.img)}
      id={id}
    >
      {props.img == null ? null : <img src={props.img} alt="Chess Piece" id={id_image}/>}
    </div>
  );
};

export const WhiteTile: Component<tileProps> = (props: tileProps) => {
  if (props.piece) {
/*     NonMovableCoords().push({ x: props.x, y: props.y }); */
    NonMovableCoordsMap().set(`${props.x}${props.y}`, true);
  }
  const id = `${props.x}${props.y}`;
  const id_image = `${id}_img`;
  return (
    <div
      class={style.WhiteTile}
      onClick={() => handleTileClick(props.piece, props.x, props.y, props.img)}
      id={id}
    >
      {props.img == null ? null : <img src={props.img} alt="Chess Piece" id={id_image}/>}
    </div>
  );
};

export class Chessboard {
  init() {
    const total: number = 8;

    for (let i = 0; i < total; i++) {
      for (let j = 0; j < total; j++) {
        //Returns the image and piece according to coordinates.
        let [img, piece] = formPiece(i, j);
        if ((i + j) % 2 == 0) {
          //White tile
          TileArray().push(<WhiteTile x={j} y={i} img={img} piece={piece} />);
        } else {
          //Black tile
          TileArray().push(<BlackTile x={j} y={i} img={img} piece={piece} />);
        }
        AllCoords().push({ x: j, y: i });
      }
    }
    return <div class={style.Board}>{TileArray()}</div>;
  }
}
