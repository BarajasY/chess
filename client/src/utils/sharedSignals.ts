import { JSXElement, createSignal } from "solid-js";
import { ChessPiece, Coordinates } from "./types";

export const [TableCode, setTableCode] = createSignal<string>("");
export const [UserCode, setUserCode] = createSignal<string>("");
export const [IncomingMovement, setIncomingMovement] = createSignal<string>("");

export const [SelectedTileX, setSelectedTileX] = createSignal<number>();
export const [SelectedTileY, setSelectedTileY] = createSignal<number>();
export const [SelectedTilePiece, setSelectedTilePiece] = createSignal<Symbol>();
export const [SelectedTileImg, setSelectedTileImg] = createSignal<string>();

export const [AllPieces, setAllPieces] = createSignal<ChessPiece[]>([]);

export const [MovableCoords, setMovableCoords] = createSignal<Coordinates[]>([]);
export const [NonMovableCoords, setNonMovableCoords] = createSignal<Coordinates[]>([]);
export const [AllCoords, setAllCoords] = createSignal<Coordinates[]>([]);
export const [MovableTiles, setMovableTiles] = createSignal<HTMLElement[] | null>([]);
export const [NonMovableCoordsMap, setNonMovableCoordsMap] = createSignal<Map<string, boolean>>(new Map());
export const [MovableCoordsMap, setMovableCoordsMap] = createSignal<Map<string, boolean>>(new Map());
export const [FirstClick, setFirstClick] = createSignal<boolean>(false);
export const [TileArray, setTileArray] = createSignal<JSXElement[]>([]);
