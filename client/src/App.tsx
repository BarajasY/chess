import { createSignal, type Component, For } from "solid-js";
import styles from "./styles/App.module.css";
import ShortUniqueId from "short-unique-id";
import { MatchesData, MessageReceived } from "./utils/types";

const App: Component = () => {
  const [TableCode, setTableCode] = createSignal<string>("");
  const [Code, setCode] = createSignal<string>("");
  const [InputMessage, setInputMessage] = createSignal<string>("");
  const [ReceivedMessage, setReceivedMessage] = createSignal<string>("");
  const [AvailableMatches, setAvailableMatches] = createSignal<MatchesData[]>(
    []
  );
  const [UserCode, setUserCode] = createSignal<string>("");

  const server = new WebSocket("ws://127.0.0.1:8000/ws");
  const uid = new ShortUniqueId();

  //Send text to websocket.
  const createTable = () => {
    server.send(
      JSON.stringify({
        table_code: uid(),
        msg: "",
        msg_type: "CTable",
        user_code: UserCode(),
        open: true,
      })
    );
  };

  const joinTable = (code: string) => {
    server.send(
      JSON.stringify({
        table_code: code,
        msg_type: "JTable",
        user_code: UserCode(),
        msg: "",
      })
    );
  };

  const submitMessage = () => {
    server.send(
      JSON.stringify({
        table_code: TableCode(),
        msg: InputMessage(),
        msg_type: "Movement",
        user_code: UserCode(),
      })
    );
  };

  //Close the websocket connection in THIS client.
  const close = () => {
    server.close();
  };

  //What to do when websocket receives a mesasge.
  server.addEventListener("message", (event) => {
    const parsed: MessageReceived = JSON.parse(event.data);
    console.log(parsed);
    if (parsed.msg_type == "CTable" || parsed.msg_type == "JTable") {
      setTableCode(parsed.table_code);
    } else if (parsed.msg_type == "Delete") {
      setTableCode("");
    } else if (parsed.msg_type == "Movement") {
      setReceivedMessage(parsed.msg);
    } else if (parsed.msg_type == "Matches") {
      setReceivedMessage("");
      setAvailableMatches(JSON.parse(parsed.msg));
    } else if (parsed.msg_type == "PgNotification") {
      setAvailableMatches([...AvailableMatches(), JSON.parse(parsed.msg)]);
    }
  });

  //Prints when it connects to a websocket.
  server.addEventListener("open", (event) => {
    console.log("WebSocket opened!");
    setUserCode(uid());
  });

  server.addEventListener("close", (event) => {
    server.send(
      JSON.stringify({
        table_code: TableCode(),
        msg: "Match has finished because one of the players left.",
        msg_type: "Delete",
        user_code: UserCode(),
      })
    );
  });

  return (
    <div class={styles.AppContainer}>
      <div class={styles.AppHeader}>
        <h1>Chessing</h1>
        <section class={styles.ChessOptions}>
          <article class={styles.CreateTable}>
            <button>Create Table</button>
          </article>
          <article class={styles.JoinTable}>
            <p>If you've got a code</p>
            <input type="text" onchange={(e) => setCode(e.target.value)}/>
            <button>Find match</button>
          </article>
        </section>
        <div class={styles.MatchesList}>
          <p>Join an open match!</p>
          <For each={AvailableMatches()}>{(match, i) => (
            <button>{match.code}</button>
          )}
          </For>
        </div>
      </div>
{/*       <section>
        <input
          type="text"
          name="test"
          placeholder="message"
          oninput={(e) => setInputMessage(e.target.value)}
          autocomplete="off"
          onkeypress={(e) => e.key == "Enter" && createTable()}
        />
        <button onclick={() => submitMessage()}>Send Message</button>
      </section>
      <section>
        <input
          type="text"
          name="test"
          placeholder="code"
          oninput={(e) => setCode(e.target.value)}
          autocomplete="off"
          onkeypress={(e) => e.key == "Enter" && createTable()}
        />
        <button onclick={() => createTable()}>create table</button>
        <button onclick={() => joinTable(Code())}>join table</button>
      </section>
      <p>Table code: <span>{TableCode()}</span></p>
      <h1>{ReceivedMessage()}</h1>
      <p>Join a Room!</p>
      <div class={styles.MatchesContainer}>
        <For each={AvailableMatches()}>
          {(match, i) => (
            <>
              <h1
                class={styles.MatchCodes}
                onclick={() => joinTable(match.code)}
              >
                {match.code}
              </h1>
            </>
          )}
        </For>
      </div> */}
    </div>
  );
};

export default App;
