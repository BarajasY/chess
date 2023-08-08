import type { Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';

const App: Component = () => {

    const server = new WebSocket("ws://127.0.0.1:8000/ws");

    const test = () => {
      server.send("Hola");
    }

      server.addEventListener("message", (event) => {
        console.log(event);
      })

      server.addEventListener("open", (event) => {
        console.log("WebSocket opened!")
        console.log(event)
      })


  return (
    <div class={styles.App}>
      <h1>Hola</h1>
      <button onclick={() => test()}>Wasd</button>
    </div>
  );
};

export default App;
