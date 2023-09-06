import { Component } from "solid-js";
import style from "../styles/ChessBoard.module.css";
import { tileProps } from "./types";
import { handleTileClick } from "./TileMovement";

//Black Tile Component
export const BlackTile: Component<tileProps> = (props: tileProps) => {
  const id = `${props.x}${props.y}`;
  const id_image = `${id}_img`;

  return (
    <div
    class={style.BlackTile}
    onClick={() =>
      handleTileClick(props.piece, props.x, props.y, props.img, props.index, props.team, props.server)
    }
    id={id}
    >
      {props.img == null ? null : (
        <img src={props.img} alt="Chess Piece" id={id_image} />
        )}
    </div>
  );
};

//White Tile Component
export const WhiteTile: Component<tileProps> = (props: tileProps) => {
  const id = `${props.x}${props.y}`;
  const id_image = `${id}_img`;

  return (
    <div
      class={style.WhiteTile}
      onClick={() =>
        handleTileClick(props.piece, props.x, props.y, props.img, props.index, props.team, props.server)
      }
      id={id}
    >
      {props.img == null ? null : (
        <img src={props.img} alt="Chess Piece" id={id_image} />
      )}
    </div>
  );
};
