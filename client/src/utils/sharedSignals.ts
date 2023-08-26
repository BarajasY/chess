import { createSignal } from "solid-js";

export const [TableCode, setTableCode] = createSignal<string>("");
export const [UserCode, setUserCode] = createSignal<string>("");
export const [IncomingMovement, setIncomingMovement] = createSignal<string>("");
