export type MessageReceived = {
    table_code: string,
    msg: string,
    msg_type: string,
    user_code: string
}

export type MatchesData = {
    code: string,
    user_one_code: string,
    user_two_code: string | undefined,
    open: boolean
}

export type Coordinates = {
    x: number,
    y: number
}

export type ChessPiece = {
    img: string | null,
    coordinates: Coordinates,
    type: Symbol | null,
    tile: Symbol | null,
    team: Symbol | null
}

export interface tileProps {
    img: string | null;
    x: number;
    y: number;
    piece: Symbol | null;
    index: number;
    team: Symbol | null;
  }
