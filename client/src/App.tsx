import { createSignal, type Component } from "solid-js";

import styles from "./App.module.css";
import ShortUniqueId from "short-unique-id";

const App: Component = () => {
  const [WaitingGame, setWaitingGame] = createSignal<boolean>(false);
  const [TableId, setTableId] = createSignal<string>("");
  const [InputMessage, setInputMessage] = createSignal<string>("");
  const [ReceivedMessage, setReceivedMessage] = createSignal<string>("");

  const server = new WebSocket("ws://127.0.0.1:8000/ws");
  const uid = new ShortUniqueId();

  //Send text to websocket.
  const test = () => {
    server.send(InputMessage());
  };

  //Close the websocket connection in THIS client.
  const close = () => {
    server.close();
  };

  const showid = () => {
    setTableId(uid());
    setWaitingGame(!WaitingGame());
  };
  //What to do when websocket sends a mesasge.
  server.addEventListener("message", (event) => {
    setReceivedMessage(event.data);
    console.log(event);
  });

  //Prints when it connects to a websocket.
  server.addEventListener("open", (event) => {
    console.log("WebSocket opened!");
  });

  return (
    <div class={styles.App}>
      <h1>Hola</h1>
      <input
        type="text"
        name="test"
        oninput={(e) => setInputMessage(e.target.value)}
        autocomplete="off"
        onkeypress={(e) => e.key == "Enter" && test()}
      />
      <button onclick={() => test()}>Send</button>

      {/*       <button onclick={() => test()}>Wasd</button> */}
      {/*       <button onclick={() => close()}>Close</button>
      <button onclick={() => showid()}>create game</button>
      {WaitingGame() ?
        <div class='wasd'>
          <h1>Waiting for table!</h1>
          <h1>Here's your table id {TableId()}</h1>
        </div>
      : null} */}
      <h1>{ReceivedMessage()}</h1>
    </div>
  );
};

export default App;
