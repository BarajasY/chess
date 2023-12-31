import { For } from "solid-js";
import style from "../styles/ChessBoard.module.css";
import {
  AllPieces,
  setAllPieces,
  setNonMovableCoordsMap,
} from "./sharedSignals";
import { ChessPiece } from "./types";
import { WhiteTile, BlackTile } from "./Tiles";
import { formPiece } from "./PieceFormation";

export const PiecesEnum = {
  BPawn: Symbol("BPawn"),
  WPawn: Symbol("WPawn"),
  Bishop: Symbol("Bishop"),
  Rook: Symbol("Rook"),
  King: Symbol("King"),
  Queen: Symbol("Queen"),
  Knight: Symbol("Knight"),
};

export const TileEnum = {
  White: Symbol("White"),
  Black: Symbol("Black"),
};

export const TeamEnum = {
  BlackTeam: Symbol("BlackTeam"),
  WhiteTeam: Symbol("WhiteTeam")
}

export class Chessboard {
  init(server:WebSocket) {
    const total: number = 8;
    let temp:Map<string, Symbol> = new Map();

    for (let i = 0; i < total; i++) {
      for (let j = 0; j < total; j++) {
        //Empty piece that will be filled.
        let onePiece: ChessPiece = {
          img: null,
          coordinates: { x: j, y: i },
          type: null,
          tile: null,
          team: null
        };
        //Uses formPiece function which throws img, piece and team according to x (j) and y (i) coordinates.
        let [img, piece, team] = formPiece(j, i);
        onePiece.img = img;
        onePiece.type = piece;
        if(piece) {
          onePiece.team = team;
          temp.set(`${j}${i}`, team!)
        }
        if ((i + j) % 2 == 0) {
          onePiece.tile = TileEnum.White;
        } else {
          onePiece.tile = TileEnum.Black;
        }
        setAllPieces((value) => [...value, onePiece]);
      }
    }

    setNonMovableCoordsMap(temp);

    return (
      <div class={style.Board}>
        <For each={AllPieces()}>
          {(piece, i) => (
            <div>
              {piece.tile == TileEnum.White && (
                <WhiteTile
                  img={piece.img}
                  x={piece.coordinates.x}
                  y={piece.coordinates.y}
                  piece={piece.type}
                  index={i()}
                  team={piece.team}
                  server={server}
                />
              )}
              {piece.tile == TileEnum.Black && (
                <BlackTile
                  img={piece.img}
                  x={piece.coordinates.x}
                  y={piece.coordinates.y}
                  piece={piece.type}
                  index={i()}
                  team={piece.team}
                  server={server}
                />
              )}
            </div>
          )}
        </For>
      </div>
    );
  }
}
