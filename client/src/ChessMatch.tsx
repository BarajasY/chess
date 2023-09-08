import { Component, For, createSignal } from "solid-js";
import style from "./styles/ChessMatch.module.css";
import {
  CurrentTurn,
  SelectedNumber,
  TableCode,
  UserCode,
  UserTeam,
  setSelectedNumber,
} from "./utils/sharedSignals";
import { Chessboard, TeamEnum } from "./utils/ChessBoard";

interface Props {
  server: WebSocket;
}

const ChessMatch: Component<Props> = ({ server }) => {
  const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const sendNumberMessage = (number: number) => {
    setSelectedNumber(number);
    server.send(
      JSON.stringify({
        table_code: TableCode(),
        msg: `${SelectedNumber()}`,
        msg_type: "Number",
        user_code: UserCode(),
      })
    );
  };

  const formatTeamName = (team: Symbol): string => {
    if (team === TeamEnum.BlackTeam) {
      return "Black";
    } else if (team === TeamEnum.WhiteTeam) {
      return "White";
    } else {
      return "";
    }
  };

  const board = new Chessboard();

  return (
    <div class={style.ChessWrapper}>
      <div class={style.ChessContent} id="match">
        {CurrentTurn() ? <h1>It's your turn!</h1> : <h1>It's not your turn</h1>}
        {UserTeam() != undefined && <h1>You are in the {formatTeamName(UserTeam()!)} team</h1>}
        {board.init(server)}
      </div>
      {UserTeam() ? null : (
        <div class={style.ChessTeam}>
          <section class={style.ChessTeamContent}>
            {SelectedNumber() != undefined ? (
              <>
                <h1>Waiting for your opponent</h1>
              </>
            ) : (
              <>
                <h1>Select a Number</h1>
                <article>
                  <For each={numbers}>
                    {(number) => (
                      <button onClick={() => sendNumberMessage(number)}>
                        {number}
                      </button>
                    )}
                  </For>
                </article>
              </>
            )}
            <h1>Number Selected: {SelectedNumber()}</h1>
          </section>
        </div>
      )}
    </div>
  );
};

export default ChessMatch;
