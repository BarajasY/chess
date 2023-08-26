import { Component, onMount } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import { IncomingMovement, TableCode, UserCode } from "./utils/sharedSignals";
import { match, renderer } from "./three/main";

interface Props {
    server: WebSocket
}

const ChessMatch: Component<Props> = ({server}) => {

    onMount(() => {
        match?.appendChild(renderer.domElement)
    })

    const sendMessage = () => {
        server.send(JSON.stringify({
            table_code: TableCode(),
          msg: "D8",
          msg_type: "Movement",
          user_code: UserCode()
        }))
    }

  return (
    <div class={style.ChessContent} id="match">
      <h1 onclick={() => sendMessage()}>wasd</h1>
      {IncomingMovement()}
    </div>
  );
};

export default ChessMatch;
