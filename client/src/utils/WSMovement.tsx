import { AllPieces, setAllPieces } from "./sharedSignals";
import { ChessPiece, Coordinates } from "./types";

export const WSMovement = (origin: Coordinates, end: Coordinates) => {
  let originElement: ChessPiece;
  //Find the piece
  for (let i = 0; i < AllPieces().length; i++) {
    const element = AllPieces()[i];
    if (
      element.coordinates.x === origin.x &&
      element.coordinates.y === origin.y
    ) {
      originElement = element;
      console.log(originElement)
    }
  }
  setAllPieces((pieces) => {
    return pieces.map((piece, i) => {
      //Delete piece from origin tile.
      if (
        piece.coordinates.x === origin.x &&
        piece.coordinates.y === origin.y
      ) {
        return { ...piece, img: null, team: null, type: null };
      }
      //Inserting data into end tile.
      if (piece.coordinates.x === end.x && piece.coordinates.y === end.y) {
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
};
