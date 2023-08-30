import { Component, onMount } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import { IncomingMovement, TableCode, UserCode } from "./utils/sharedSignals";
import { renderer } from "./three/main";
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

  return (
    <div class={style.ChessWrapper}>
      <div class={style.ChessContent} id="match">
        {board.init()}
      </div>
    </div>
  );
};

export default ChessMatch;
