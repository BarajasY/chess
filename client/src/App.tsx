import { createSignal, type Component } from "solid-js";

import styles from "./App.module.css";
import ShortUniqueId from "short-unique-id";
import { MessageReceived } from "./utils/types";

const App: Component = () => {
  const [TableId, setTableId] = createSignal<string>("");
  const [Code, setCode] = createSignal<string>("");
  const [InputMessage, setInputMessage] = createSignal<string>("");
  const [ReceivedMessage, setReceivedMessage] = createSignal<string>("");

  const server = new WebSocket("ws://127.0.0.1:8000/ws");
  const uid = new ShortUniqueId();

  //Send text to websocket.
  const test = () => {
    server.send(JSON.stringify({
      code: Code(),
      msg: InputMessage(),
      msg_type: "CTable"
    }));
  };

  const test2 = () => {
    server.send(JSON.stringify({
      code: Code(),
      msg: InputMessage(),
      msg_type: "Movement"
    }));
  };

  //Close the websocket connection in THIS client.
  const close = () => {
    server.close();
  };

  const showid = () => {
    setTableId(uid());
  };

  //What to do when websocket receives a mesasge.
  server.addEventListener("message", (event) => {
/*     const parsed:MessageReceived = JSON.parse(event.data); */
    setReceivedMessage(event.data);
/*     console.log(JSON.parse(event.data)); */
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
        placeholder="message"
        oninput={(e) => setInputMessage(e.target.value)}
        autocomplete="off"
        onkeypress={(e) => e.key == "Enter" && test()}
      />
      <input
        type="text"
        name="test"
        placeholder="code"
        oninput={(e) => setCode(e.target.value)}
        autocomplete="off"
        onkeypress={(e) => e.key == "Enter" && test()}
      />
      <button onclick={() => test()}>Send code("CTable")</button>
      <button onclick={() => test2()}>Send code("Movement")</button>
      <h1>{ReceivedMessage()}</h1>
    </div>
  );
};

export default App;
