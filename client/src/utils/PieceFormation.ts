import { PiecesEnum } from "./ChessBoard";
import w_pawn from "../assets/pawn_w.png";
import b_pawn from "../assets/pawn_b.png";
import w_bishop from "../assets/bishop_w.png";
import b_bishop from "../assets/bishop_b.png";
import w_king from "../assets/king_w.png";
import b_king from "../assets/king_b.png";
import w_queen from "../assets/queen_w.png";
import b_queen from "../assets/queen_b.png";
import w_rook from "../assets/rook_w.png";
import b_rook from "../assets/rook_b.png";
import w_knight from "../assets/knight_w.png";
import b_knight from "../assets/knight_b.png";

export const formPiece = (y: number, x: number): [string | null, Symbol | null] => {
    let img: string | null = null;
    let piece: Symbol | null = null;

    //Black pieces
    if (y == 1) {
      img = b_pawn;
      piece = PiecesEnum.BPawn;
    }
    if (y == 0) {
      if (x == 0 || x == 7) {
        img = b_rook;
        piece = PiecesEnum.Rook;
      }
      if (x == 1 || x == 6) {
        img = b_knight;
        piece = PiecesEnum.Knight;
      }
      if (x == 2 || x == 5) {
        img = b_bishop;
        piece = PiecesEnum.Bishop;
      }
      if (x == 3) {
        img = b_queen;
        piece = PiecesEnum.Queen;
      }
      if (x == 4) {
        img = b_king;
        piece = PiecesEnum.King;
      }
    }
    //

    //White pieces
    if (y == 6) {
      img = w_pawn;
      piece = PiecesEnum.WPawn;
    }
    if (y == 7) {
      if (x == 0 || x == 7) {
        img = w_rook;
        piece = PiecesEnum.Rook;
      }
      if (x == 1 || x == 6) {
        img = w_knight;
        piece = PiecesEnum.Knight;
      }
      if (x == 2 || x == 5) {
        img = w_bishop;
        piece = PiecesEnum.Bishop;
      }
      if (x == 3) {
        img = w_queen;
        piece = PiecesEnum.Queen;
      }
      if (x == 4) {
        img = w_king;
        piece = PiecesEnum.King;
      }
    }

    return [img, piece];
  };
