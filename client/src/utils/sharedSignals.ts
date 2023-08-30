import { createSignal } from "solid-js";
import { Group } from "three";
import { Coordinates } from "./types";

export const [TableCode, setTableCode] = createSignal<string>("");
export const [UserCode, setUserCode] = createSignal<string>("");
export const [IncomingMovement, setIncomingMovement] = createSignal<string>("");

export const [ChessModel, setChessModel] = createSignal<Group>();

export const [SelectedTileX, setSelectedTileX] = createSignal<number>();
export const [SelectedTileY, setSelectedTileY] = createSignal<number>();
export const [MovableCoords, setMovableCoords] = createSignal<Coordinates[]>([]);
export const [NonMovableCoords, setNonMovableCoords] = createSignal<Coordinates[]>([]);
