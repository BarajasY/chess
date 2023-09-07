import { PiecesEnum, TeamEnum } from "./ChessBoard";
import {
  setFirstClick,
  FirstClick,
  setMovableCoords,
  MovableCoordsMap,
  NonMovableCoordsMap,
  setAllPieces,
  setNonMovableCoordsMap,
  MovableCoords,
  MovableTiles,
  setMovableTiles,
  setAttackCoords,
  AttackCoords,
  AttackTiles,
  setAttackTiles,
  setSelectedTile,
  SelectedTile,
  setPiecesEaten,
  TableCode,
  UserCode,
  UserTeam,
} from "./sharedSignals";
import { Coordinates, WSMovementCoordinates, WSMovementMessage } from "./types";

//Function whenever user clicks on a tile. /////////////////////////////////
export const handleTileClick = (
  piece: Symbol | null,
  x: number,
  y: number,
  img: string | null,
  index: number,
  team: Symbol | null,
  server: WebSocket
) => {
  if (piece != null) {
    if (team === UserTeam() || SelectedTile()?.team === UserTeam()) {
      if (FirstClick()) {
        //If the tile is a movable one.
        if (MovableCoordsMap().has(`${x}${y}`)) {
          //if the piece's team is contrary to ours.
          if (team != SelectedTile()?.team) {
            ////
            let tempmap = new Map(NonMovableCoordsMap());
            setAllPieces((pieces) => {
              return pieces.map((piece, i) => {
                if (i == index) {
                  tempmap.set(`${x}${y}`, SelectedTile()?.team!);
                  return {
                    ...piece,
                    img: SelectedTile()?.img!,
                    team: SelectedTile()?.team!,
                    type: SelectedTile()?.type!,
                  };
                } else if (i == SelectedTile()?.index) {
                  tempmap.delete(
                    `${SelectedTile()?.coordinates.x}${
                      SelectedTile()?.coordinates.y
                    }`
                  );
                  return { ...piece, img: null, team: null, type: null };
                } else {
                  return piece;
                }
              });
            });
            const text: WSMovementCoordinates = {
              origin: {
                x: SelectedTile()?.coordinates.x!,
                y: SelectedTile()?.coordinates.y!,
              },
              end: { x, y },
            };
            server.send(
              JSON.stringify({
                table_code: TableCode(),
                msg: text,
                msg_type: "Movement",
                user_code: UserCode(),
              })
            );
            setNonMovableCoordsMap(tempmap);
            setFirstClick(false);
            setMovableCoords([]);
            setAttackCoords([]);
            updateTiles();
            setSelectedTile(undefined);
            /////
          }
        }
      } else {
        //Show available movement options for piece.
        setFirstClick(true);
        setSelectedTile((value) => {
          return {
            ...value,
            img,
            coordinates: { x: x, y: y },
            type: piece,
            team,
            index,
          };
        });
        let tempcoordinates = AddMovableCoordinates(piece, x, y);
        setMovableCoords(tempcoordinates[0]);
        setAttackCoords(tempcoordinates[1]);
        updateTiles();
      }
    }
  } else {
    //Move piece to the designated position.
    if (FirstClick()) {
      if (MovableCoordsMap().has(`${x}${y}`)) {
        let tempMap = new Map(NonMovableCoordsMap());
        AddMovableCoordinates(piece, x, y);
        setAllPieces((piece) => {
          return piece.map((value, i) => {
            if (i == index) {
              tempMap.set(
                `${value.coordinates.x}${value.coordinates.y}`,
                SelectedTile()?.team!
              );
              return {
                ...value,
                img: SelectedTile()?.img!,
                type: SelectedTile()?.type!,
                team: SelectedTile()?.team!,
              };
            } else if (i == SelectedTile()?.index) {
              tempMap.delete(`${value.coordinates.x}${value.coordinates.y}`);
              return { ...value, img: null, type: null, team: null };
            } else {
              return value;
            }
          });
        });
        setNonMovableCoordsMap(tempMap);
        const text: WSMovementCoordinates = {
          origin: {
            x: SelectedTile()?.coordinates.x!,
            y: SelectedTile()?.coordinates.y!,
          },
          end: { x, y },
        };
        server.send(
          JSON.stringify({
            table_code: TableCode(),
            msg: text,
            msg_type: "Movement",
            user_code: UserCode(),
          })
        );
      }
    }
    setFirstClick(false);
    setMovableCoords([]);
    setAttackCoords([]);
    updateTiles();
    setSelectedTile(undefined);
  }
};

//Color Tiles./////////////////////////////
export const updateTiles = () => {
  MovableTiles()?.forEach((tile) =>
    tile.setAttribute("style", "border: 2px solid transparent")
  );

  AttackTiles()?.forEach((tile) =>
    tile?.setAttribute("style", "border: 2px solid transparent")
  );

  setAttackTiles([]);
  setMovableTiles([]);

  for (let i = 0; i < AttackCoords().length; i++) {
    AttackTiles()!.push(
      document.getElementById(`${AttackCoords()[i].x}${AttackCoords()[i].y}`)!
    );
    AttackTiles()![i].setAttribute("style", "border: 2px solid red");
  }

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
  //BLACK PAWN MOVEMENT ///////////////////////////////////////////////////////////////
  if (piece == PiecesEnum.BPawn) {
    if (y != 1) {
      if (!NonMovableCoordsMap().has(`${x}${y + 1}`)) {
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
    if (NonMovableCoordsMap().has(`${x + 1}${y + 1}`)) {
      if (
        NonMovableCoordsMap().get(`${x + 1}${y + 1}`) != SelectedTile()?.team
      ) {
        attack.push({ x: x + 1, y: y + 1 });
      }
    }
    if (NonMovableCoordsMap().has(`${x - 1}${y + 1}`)) {
      if (
        NonMovableCoordsMap().get(`${x - 1}${y + 1}`) != SelectedTile()?.team
      ) {
        attack.push({ x: x - 1, y: y + 1 });
      }
    }
  }
  //WHITE PAWN MOVEMENT ///////////////////////////////////////////
  if (piece == PiecesEnum.WPawn) {
    if (y != 6) {
      if (!NonMovableCoordsMap().has(`${x}${y - 1}`)) {
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
    if (NonMovableCoordsMap().has(`${x + 1}${y - 1}`)) {
      if (
        NonMovableCoordsMap().get(`${x + 1}${y - 1}`) != SelectedTile()?.team
      ) {
        attack.push({ x: x + 1, y: y - 1 });
      }
    }
    if (NonMovableCoordsMap().has(`${x - 1}${y - 1}`)) {
      if (
        NonMovableCoordsMap().get(`${x - 1}${y - 1}`) != SelectedTile()?.team
      ) {
        attack.push({ x: x - 1, y: y - 1 });
      }
    }
  }
  //BISHOP MOVEMENT ///////////////////////////////////////////////
  if (piece == PiecesEnum.Bishop) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().has(`${x + i}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y + i });
        }
        break;
      }
      coords.push({ x: x + i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().has(`${x + i}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y - i });
        }
        break;
      }
      coords.push({ x: x + i, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().has(`${x - i}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y + i });
        }
        break;
      }
      coords.push({ x: x - i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().has(`${x - i}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y - i });
        }
        break;
      }
      coords.push({ x: x - i, y: y - i });
    }
  }
  //ROOK MOVEMENT ///////////////////////////////////////////////
  if (piece == PiecesEnum.Rook) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x, y: y + i });
        }
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y });
        }
        break;
      }
      coords.push({ x: x + i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x, y: y - i });
        }
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y });
        }
        break;
      }
      coords.push({ x: x - i, y: y });
    }
  }
  // KNIGHT MOVEMENT ////////////////////////////////////////////
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
      if (NonMovableCoordsMap().has(`${coord.x}${coord.y}`)) {
        if (
          NonMovableCoordsMap().get(`${coord.x}${coord.y}`) !==
          SelectedTile()?.team
        ) {
          attack.push({ x: coord.x, y: coord.y });
        }
      } else {
        test.push(coord);
      }
    });
    coords = test;
  }
  //QUEEN MOVEMENT ////////////////////////////////////////////
  if (piece == PiecesEnum.Queen) {
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x, y: y + i });
        }
        break;
      }
      coords.push({ x: x, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x, y: y - i });
        }
        break;
      }
      coords.push({ x: x, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y });
        }
        break;
      }
      coords.push({ x: x + i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y });
        }
        break;
      }
      coords.push({ x: x - i, y: y });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y + i });
        }
        break;
      }
      coords.push({ x: x + i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x + i}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x + i}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x + i, y: y - i });
        }
        break;
      }
      coords.push({ x: x + i, y: y - i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y + i}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y + i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y + i });
        }
        break;
      }
      coords.push({ x: x - i, y: y + i });
    }
    for (let i = 1; i <= 8; i++) {
      if (NonMovableCoordsMap().get(`${x - i}${y - i}`)) {
        if (
          NonMovableCoordsMap().get(`${x - i}${y - i}`) !== SelectedTile()?.team
        ) {
          attack.push({ x: x - i, y: y - i });
        }
        break;
      }
      coords.push({ x: x - i, y: y - i });
    }
  }
  // KING MOVEMENT ////////////////////////////////////////////////////
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
      if (NonMovableCoordsMap().has(`${coord.x}${coord.y}`)) {
        if (
          NonMovableCoordsMap().get(`${coord.x}${coord.y}`) !==
          SelectedTile()?.team
        ) {
          attack.push({ x: coord.x, y: coord.y });
        }
      } else {
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
