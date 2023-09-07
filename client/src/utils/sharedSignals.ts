import { createSignal } from "solid-js";
import { ChessPiece, Coordinates, SelectedChessPiece } from "./types";

export const [TableCode, setTableCode] = createSignal<string>("");
export const [UserCode, setUserCode] = createSignal<string>("");
export const [IncomingMovement, setIncomingMovement] = createSignal<string>("");

export const [SelectedTile, setSelectedTile] = createSignal<SelectedChessPiece>();

export const [AllPieces, setAllPieces] = createSignal<ChessPiece[]>([]);
export const [PiecesEaten, setPiecesEaten] = createSignal<ChessPiece[]>([]);

export const [NonMovableCoordsMap, setNonMovableCoordsMap] = createSignal<Map<string, Symbol>>(new Map());
export const [AttackCoordsMap, setAttackCoordsMap] = createSignal<Map<string, Symbol>>(new Map());

export const [MovableCoords, setMovableCoords] = createSignal<Coordinates[]>([]);
export const [AttackCoords, setAttackCoords] = createSignal<Coordinates[]>([]);

export const [NonMovableCoords, setNonMovableCoords] = createSignal<Coordinates[]>([]);
export const [MovableTiles, setMovableTiles] = createSignal<HTMLElement[] | null>([]);
export const [AttackTiles, setAttackTiles] = createSignal<HTMLElement[] | null>([]);

export const [SelectedNumber, setSelectedNumber] = createSignal<number | undefined>(undefined);

export const [UserTeam, setUserTeam] = createSignal<Symbol | undefined>(undefined);

export const [MovableCoordsMap, setMovableCoordsMap] = createSignal<Map<string, boolean>>(new Map());
export const [FirstClick, setFirstClick] = createSignal<boolean>(false);
