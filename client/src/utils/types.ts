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
    img: string,
    coordinates: Coordinates,
    type: Symbol,
}
