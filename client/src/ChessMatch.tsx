import { Component, onMount } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import { IncomingMovement, TableCode, UserCode } from "./utils/sharedSignals";
import { renderer } from "./three/main";

interface Props {
  server: WebSocket;
}

const ChessMatch: Component<Props> = ({ server }) => {
  onMount(() => {
    document.body.appendChild(renderer.domElement);
  });

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

  return (
    <div class={style.ChessWrapper}>
      <div class={style.ChessContent} id="match">
        <h1 onclick={() => sendMessage()}>wasd</h1>
        {IncomingMovement()}
      </div>
    </div>
  );
};

export default ChessMatch;
