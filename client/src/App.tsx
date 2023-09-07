import { createSignal, type Component, For, lazy } from "solid-js";
import styles from "./styles/App.module.css";
import ShortUniqueId from "short-unique-id";
import { MatchesData, MessageReceived, WSMovementMessage } from "./utils/types";
const ChessMatch = lazy(() => import("./ChessMatch"));
import {
  TableCode,
  UserCode,
  setIncomingMovement,
  setTableCode,
  setUserCode,
} from "./utils/sharedSignals";
import { WSMovement } from "./utils/WSMovement";

const App: Component = () => {
  const [Code, setCode] = createSignal<string>("");
  const [InputMessage, setInputMessage] = createSignal<string>("");
  const [AvailableMatches, setAvailableMatches] = createSignal<MatchesData[]>(
    []
  );
  const [Waiting, setWaiting] = createSignal<boolean>(false);
  const [StartMatch, setStartMatch] = createSignal<boolean>(false);

  const server = new WebSocket("ws://127.0.0.1:8000/ws");
  const uid = new ShortUniqueId();

  //Send text to websocket.
  const createTable = () => {
    setWaiting(!Waiting());
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
    let parsed: MessageReceived = JSON.parse(event.data);
    if (parsed.msg_type == "CTable" || parsed.msg_type == "JTable") {
      setTableCode(parsed.table_code);
      if (parsed.msg_type == "JTable") {
        server.send(
          JSON.stringify({
            table_code: TableCode(),
            msg: "",
            msg_type: "Start",
            user_code: UserCode(),
          })
        );
      }
    } else if (parsed.msg_type == "Delete") {
      setTableCode("");
    } else if (parsed.msg_type == "Movement") {
      let parsed2: WSMovementMessage = JSON.parse(event.data);
      if (parsed2.user_code != UserCode()) {
        WSMovement(parsed2.msg.origin, parsed2.msg.end);
      }
    } else if (parsed.msg_type == "Matches") {
      setIncomingMovement("");
      setAvailableMatches(JSON.parse(parsed.msg));
    } else if (parsed.msg_type == "PgNotification") {
      setAvailableMatches([...AvailableMatches(), JSON.parse(parsed.msg)]);
    } else if (parsed.msg_type == "Start") {
      setStartMatch(true);
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
      {StartMatch() ? (
        <ChessMatch server={server} />
      ) : (
        <div class={styles.AppHeader}>
          <h1>Chessing</h1>
          <section class={styles.ChessOptions}>
            <article class={styles.CreateTable}>
              <button onclick={() => createTable()}>Create Table</button>
            </article>
            <article class={styles.JoinTable}>
              <p>If you've got a code</p>
              <input type="text" onchange={(e) => setCode(e.target.value)} />
              <button onClick={() => joinTable(Code())}>Find match</button>
            </article>
          </section>
          <div class={styles.MatchesList}>
            <p>Join an open match!</p>
            <div class={styles.Matches}>
              <For each={AvailableMatches()}>
                {(match, i) => (
                  <button onClick={() => joinTable(match.code)}>
                    {match.code}
                  </button>
                )}
              </For>
            </div>
          </div>
          {Waiting() && (
            <div class={styles.WaitingContainer}>
              <div class={styles.WaitingContent}>
                <h1>Waiting for your opponent</h1>
                <p>
                  Your table code is <span>{TableCode()}</span>
                </p>
                <div class={styles.WaitingSignal}>
                  <h1>.</h1>
                  <h1>.</h1>
                  <h1>.</h1>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
