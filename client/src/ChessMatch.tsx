import { Component } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import {
  AllPieces,
  IncomingMovement,
  TableCode,
  TileArray,
  UserCode,
  setAllPieces,
} from "./utils/sharedSignals";
import { Chessboard } from "./utils/ChessBoard";

interface Props {
  server: WebSocket;
}

const ChessMatch: Component<Props> = ({ server }) => {
  const sendMessage = () => {
    server.send(
      JSON.stringify({
        table_code: TableCode(),
        msg: "D8",
        msg_type: "Movement",
        user_code: UserCode(),
      })
    );
  };

  const board = new Chessboard();

/*   const test = () => {
    setAllPieces(pieces => {
      return pieces.map((piece, i) => {
        if(i == 5) {
          return {...piece, img: pawn_w}
        } else {
          return piece
        }
      })
    })
  }; */

  return (
    <div class={style.ChessWrapper}>
      <div class={style.ChessContent} id="match">
        {board.init()}
      </div>
    </div>
  );
};

export default ChessMatch;
