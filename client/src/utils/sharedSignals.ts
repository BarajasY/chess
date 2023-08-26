import { createSignal } from "solid-js";
import { Group } from "three";

export const [TableCode, setTableCode] = createSignal<string>("");
export const [UserCode, setUserCode] = createSignal<string>("");
export const [IncomingMovement, setIncomingMovement] = createSignal<string>("");

export const [ChessModel, setChessModel] = createSignal<Group>();
