import { Component, JSXElement, onMount } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import { IncomingMovement, TableCode, TileArray, UserCode } from "./utils/sharedSignals";
import { Chessboard, PiecesEnum, WhiteTile } from "./utils/ChessBoard";
import pawn_w from "./assets/pawn_w.png"
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

  return (
    <div class={style.ChessWrapper}>
      <div class={style.ChessContent} id="match">
        {board.init()}
      </div>
    </div>
  );
};

export default ChessMatch;
