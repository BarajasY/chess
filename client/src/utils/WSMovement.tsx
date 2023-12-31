import { AllPieces, NonMovableCoordsMap, setAllPieces, setNonMovableCoords, setNonMovableCoordsMap } from "./sharedSignals";
import { ChessPiece, Coordinates } from "./types";

export const WSMovement = (origin: Coordinates, end: Coordinates) => {
  let originElement: ChessPiece;
  let tempmap = new Map(NonMovableCoordsMap());
  //Find the piece
  for (let i = 0; i < AllPieces().length; i++) {
    const element = AllPieces()[i];
    if (
      element.coordinates.x === origin.x &&
      element.coordinates.y === origin.y
    ) {
      originElement = element;
    }
  }
  setAllPieces((pieces) => {
    return pieces.map((piece, i) => {
      //Delete piece from origin tile.
      if (
        piece.coordinates.x === origin.x &&
        piece.coordinates.y === origin.y
      ) {
        tempmap.delete(`${origin.x}${origin.y}`);
        return { ...piece, img: null, team: null, type: null };
      }
      //Inserting data into end tile.
      if (piece.coordinates.x === end.x && piece.coordinates.y === end.y) {
        tempmap.set(`${end.x}${end.y}`, originElement.team!);
        return {
          ...piece,
          img: originElement.img,
          team: originElement.team,
          type: originElement.type,
        };
      }
      return piece;
    });
  });
  setNonMovableCoordsMap(tempmap)
};
