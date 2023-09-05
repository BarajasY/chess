import { PiecesEnum, TeamEnum } from "./ChessBoard";
import {
  setFirstClick,
  FirstClick,
  setMovableCoords,
  setSelectedTileX,
  setSelectedTileY,
  setSelectedTilePiece,
  setSelectedTileImg,
  setSelectedTileIndex,
  MovableCoordsMap,
  NonMovableCoordsMap,
  setAllPieces,
  SelectedTileImg,
  SelectedTileIndex,
  setNonMovableCoordsMap,
  MovableCoords,
  MovableTiles,
  setMovableTiles,
  SelectedTilePiece,
  setSelectedTileTeam,
  SelectedTileTeam,
  setAttackCoords,
} from "./sharedSignals";
import { Coordinates } from "./types";

//Function whenever user clicks on a tile. /////////////////////////////////
export const handleTileClick = (
  piece: Symbol | null,
  x: number,
  y: number,
  img: string | null,
  index: number,
  team: Symbol | null
) => {
  if (piece != null) {
    setFirstClick(true);
    updateTiles();
    setSelectedTileX(x);
    setSelectedTileY(y);
    setSelectedTilePiece(piece);
    setSelectedTileImg(img!);
    setSelectedTileIndex(index);
    setSelectedTileTeam(team!);

    let tempcoordinates = AddMovableCoordinates(piece, x, y);

    setMovableCoords(tempcoordinates[0]);
    setAttackCoords(tempcoordinates[1]);
  } else {
    if (FirstClick()) {
      if (MovableCoordsMap().has(`${x}${y}`)) {
        let tempMap = new Map(NonMovableCoordsMap());
        AddMovableCoordinates(piece, x, y);
        setAllPieces((piece) => {
          return piece.map((value, i) => {
            if (i == index) {
              tempMap.set(
                `${value.coordinates.x}${value.coordinates.y}`,
                team!
              );
              return {
                ...value,
                img: SelectedTileImg()!,
                type: SelectedTilePiece()!,
              };
            } else if (i == SelectedTileIndex()) {
              tempMap.delete(`${value.coordinates.x}${value.coordinates.y}`);
              return { ...value, img: null, type: null };
            } else {
              return value;
            }
          });
        });
        setNonMovableCoordsMap(tempMap);
      }
      setFirstClick(false);
      setMovableCoords([]);
      updateTiles();
      setSelectedTilePiece(undefined);
      setSelectedTileX(undefined);
      setSelectedTileY(undefined);
      setSelectedTileImg(undefined);
      setSelectedTileTeam(undefined);
    }
  }
};

//Color Tiles./////////////////////////////
export const updateTiles = () => {
  MovableTiles()?.forEach((tile) =>
    tile.setAttribute("style", "border: 2px solid transparent")
  );

  setMovableTiles([]);

  for (let i = 0; i < MovableCoords().length; i++) {
    MovableTiles()!.push(
      document.getElementById(`${MovableCoords()[i].x}${MovableCoords()[i].y}`)!
    );
    MovableTiles()![i].setAttribute("style", "border: 2px solid white");
  }
};

//Function that engages whenever user clicks on a tile with a chess piece.
//This function calculates the available tiles a piece can move according to the type of piece.
//.//////////////////////////////////////////////////////////////////////////////////////////////
export const AddMovableCoordinates = (
  piece: Symbol | null,
  x: number,
  y: number
): [Coordinates[], Coordinates[]] => {
  MovableCoordsMap().clear();
  let coords: Coordinates[] = [];
  let attack: Coordinates[] = [];
  if (piece == PiecesEnum.BPawn) {
    if (y != 1) {
      if (NonMovableCoordsMap().get(`${x}${y - 1}`) != SelectedTileTeam()) {
        coords.push({ x: x, y: y + 1 });
      }
    } else {
      for (let i = 1; i <= 2; i++) {
        if (NonMovableCoordsMap().get(`${x}${y + i}`)) {
          break;
        }
        coords.push({ x: x, y: y + i });
      }
    }
    //Detecting enemies on x - 1 and x + 1
    if (NonMovableCoordsMap().get(`${x + 1}${y + 1}`) != SelectedTileTeam()) {
      attack.push({ x: x + 1, y: y + 1 });
    }
    if (NonMovableCoordsMap().get(`${x - 1}${y + 1}`) != SelectedTileTeam()) {
      attack.push({ x: x - 1, y: y + 1 });
    }
  }
  if (piece == PiecesEnum.WPawn) {
    if (y != 6) {
      if (!NonMovableCoordsMap().get(`${x}${y - 1}`)) {
        coords.push({ x: x, y: y - 1 });
      }
    } else {
      for (let i = 1; i <= 2; i++) {
        if (NonMovableCoordsMap().get(`${x}${y - i}`)) {
          break;
        }
        coords.push({ x: x, y: y - i });
      }
    }
    //Detecting enemies on x - 1 and x + 1
    if (NonMovableCoordsMap().get(`${x + 1}${y - 1}`) != SelectedTileTeam()) {
      attack.push({ x: x + 1, y: y - 1 });
    }
    if (NonMovableCoordsMap().get(`${x - 1}${y - 1}`) != SelectedTileTeam()) {
      attack.push({ x: x - 1, y: y - 1 });
    }
  }
  if (piece == PiecesEnum.Bishop) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y + i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y - i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y + i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y - i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y - i });
    }
  }
  if (piece == PiecesEnum.Rook) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y + i}`)) {
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y}`)) {
        break;
      }
      coords.push({ x: x + i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y - i}`)) {
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y}`)) {
        break;
      }
      coords.push({ x: x - i, y: y });
    }
  }
  if (piece == PiecesEnum.Knight) {
    const test: Coordinates[] = [];
    coords.push({ x: x + 2, y: y + 1 });
    coords.push({ x: x + 1, y: y - 2 });
    coords.push({ x: x - 1, y: y - 2 });
    coords.push({ x: x + 2, y: y - 1 });
    coords.push({ x: x + 1, y: y + 2 });
    coords.push({ x: x - 1, y: y + 2 });
    coords.push({ x: x - 2, y: y + 1 });
    coords.push({ x: x - 2, y: y - 1 });
    coords.forEach((coord) => {
      if (!NonMovableCoordsMap().get(`${coord.x}${coord.y}`)) {
        test.push(coord);
      }
    });
    coords = test;
  }
  if (piece == PiecesEnum.Queen) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y + i}`)) {
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y - i}`)) {
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y}`)) {
        break;
      }
      coords.push({ x: x + i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y}`)) {
        break;
      }
      coords.push({ x: x - i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y + i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y - i}`)) {
        break;
      }
      coords.push({ x: x + i, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y + i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y - i}`)) {
        break;
      }
      coords.push({ x: x - i, y: y - i });
    }
  }
  if (piece == PiecesEnum.King) {
    const test: Coordinates[] = [];
    coords.push({ x: x, y: y + 1 });
    coords.push({ x: x, y: y - 1 });
    coords.push({ x: x + 1, y: y });
    coords.push({ x: x - 1, y: y });
    coords.push({ x: x + 1, y: y + 1 });
    coords.push({ x: x + 1, y: y - 1 });
    coords.push({ x: x - 1, y: y + 1 });
    coords.push({ x: x - 1, y: y - 1 });
    coords.forEach((coord) => {
      if (!NonMovableCoordsMap().get(`${coord.x}${coord.y}`)) {
        test.push(coord);
      }
    });
    coords = test;
  }

  let coordsresult = coords.filter(
    (coord) => coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8
  );

  let attackresult = attack.filter(
    (coord) => coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8
  );

  coordsresult.forEach((coord) => {
    MovableCoordsMap().set(`${coord.x}${coord.y}`, true);
  });

  attackresult.forEach((coord) => {
    MovableCoordsMap().set(`${coord.x}${coord.y}`, true);
  });

  return [coordsresult, attack];
};
