import { assert } from '@mfro/ts-common/assert';

export type Color = 'w' | 'b';
export type PieceKind = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

export namespace Color {
  export const
    white = 'w',
    black = 'b';

  export function other(c: Color): Color {
    return c == white ? black : white;
  }
}

export interface Position {
  rank: Rank;
  file: File;
}

export namespace Position {
  function p(strings: TemplateStringsArray): Position {
    const rank = parseInt(strings[0][1], 10) as Rank;
    const file = strings[0][0] as File;

    return Object.freeze({ rank, file });
  }

  export function add(from: Position, offset: Offset): Position;
  export function add(from: Position, ranks: number, files: number): Position;
  export function add(a: Position, b: number | Offset, c?: number) {
    let r = ranks.indexOf(a.rank);
    let f = files.indexOf(a.file);

    if (arguments.length == 2) {
      r += (b as Offset).ranks;
      f += (b as Offset).ranks;
    } else {
      r += b as number;
      f += c as number;
    }

    return by_rank[r][f];
  }

  export function offset(from: Position, to: Position): Offset {
    const r = ranks.indexOf(to.rank) - ranks.indexOf(from.rank);
    const f = files.indexOf(to.file) - files.indexOf(from.file);
    return { ranks: r, files: f };
  }

  export function slide(from: Position, to: Position, inclusive?: boolean): Position[];
  export function slide(from: Position, offset: Offset, inclusive?: boolean): Position[];
  export function slide(from: Position, to: Position | Offset, inclusive = false): Position[] {
    let o;
    if ('rank' in to)
      o = offset(from, to);
    else
      o = to;

    if (o.ranks != 0 && o.files != 0 && Math.abs(o.ranks) != Math.abs(o.files))
      throw new Error('invalid sequence');

    const count = Math.max(Math.abs(o.ranks), Math.abs(o.files));

    const sR = Math.sign(o.ranks);
    const sF = Math.sign(o.files);

    const result = [];

    for (let i = (inclusive ? 0 : 1); inclusive ? (i <= count) : i < count; ++i) {
      result.push(by_rank[ranks.indexOf(from.rank) + (i * sR)][files.indexOf(from.file) + (i * sF)]);
    }

    return result;
  }

  export const
    a1 = p`a1`, a2 = p`a2`, a3 = p`a3`, a4 = p`a4`, a5 = p`a5`, a6 = p`a6`, a7 = p`a7`, a8 = p`a8`,
    b1 = p`b1`, b2 = p`b2`, b3 = p`b3`, b4 = p`b4`, b5 = p`b5`, b6 = p`b6`, b7 = p`b7`, b8 = p`b8`,
    c1 = p`c1`, c2 = p`c2`, c3 = p`c3`, c4 = p`c4`, c5 = p`c5`, c6 = p`c6`, c7 = p`c7`, c8 = p`c8`,
    d1 = p`d1`, d2 = p`d2`, d3 = p`d3`, d4 = p`d4`, d5 = p`d5`, d6 = p`d6`, d7 = p`d7`, d8 = p`d8`,
    e1 = p`e1`, e2 = p`e2`, e3 = p`e3`, e4 = p`e4`, e5 = p`e5`, e6 = p`e6`, e7 = p`e7`, e8 = p`e8`,
    f1 = p`f1`, f2 = p`f2`, f3 = p`f3`, f4 = p`f4`, f5 = p`f5`, f6 = p`f6`, f7 = p`f7`, f8 = p`f8`,
    g1 = p`g1`, g2 = p`g2`, g3 = p`g3`, g4 = p`g4`, g5 = p`g5`, g6 = p`g6`, g7 = p`g7`, g8 = p`g8`,
    h1 = p`h1`, h2 = p`h2`, h3 = p`h3`, h4 = p`h4`, h5 = p`h5`, h6 = p`h6`, h7 = p`h7`, h8 = p`h8`;

  export const all = [
    a1, b1, c1, d1, e1, f1, g1, h1,
    a2, b2, c2, d2, e2, f2, g2, h2,
    a3, b3, c3, d3, e3, f3, g3, h3,
    a4, b4, c4, d4, e4, f4, g4, h4,
    a5, b5, c5, d5, e5, f5, g5, h5,
    a6, b6, c6, d6, e6, f6, g6, h6,
    a7, b7, c7, d7, e7, f7, g7, h7,
    a8, b8, c8, d8, e8, f8, g8, h8,
  ];

  export const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8];
  export const by_rank = [
    [a1, b1, c1, d1, e1, f1, g1, h1],
    [a2, b2, c2, d2, e2, f2, g2, h2],
    [a3, b3, c3, d3, e3, f3, g3, h3],
    [a4, b4, c4, d4, e4, f4, g4, h4],
    [a5, b5, c5, d5, e5, f5, g5, h5],
    [a6, b6, c6, d6, e6, f6, g6, h6],
    [a7, b7, c7, d7, e7, f7, g7, h7],
    [a8, b8, c8, d8, e8, f8, g8, h8],
  ];

  export const files: File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  export const by_file = [
    [a1, a2, a3, a4, a5, a6, a7, a8],
    [b1, b2, b3, b4, b5, b6, b7, b8],
    [c1, c2, c3, c4, c5, c6, c7, c8],
    [d1, d2, d3, d4, d5, d6, d7, d8],
    [e1, e2, e3, e4, e5, e6, e7, e8],
    [f1, f2, f3, f4, f5, f6, f7, f8],
    [g1, g2, g3, g4, g5, g6, g7, g8],
    [h1, h2, h3, h4, h5, h6, h7, h8],
  ];
}

export interface Piece {
  readonly color: Color;
  readonly kind: PieceKind;
}

export function Piece(color: Color, kind: PieceKind): Piece {
  return Object.freeze({ color, kind });
}

export namespace Piece {
  export const
    pawn = 'p',
    rook = 'r',
    knight = 'n',
    bishop = 'b',
    queen = 'q',
    king = 'k';

  export const all = [pawn, rook, knight, bishop, queen, king];
}

export interface Offset {
  ranks: number;
  files: number;
}

export function Offset(ranks: number, files: number): Offset {
  return { ranks, files };
}

export namespace Offset {
  export function eq(a: Offset, b: Offset): boolean;
  export function eq(a: Offset, ranks: number, files: number): boolean;
  export function eq(a: Offset, ranks: number | Offset, files?: number) {
    if (arguments.length == 2)
      return a.ranks == (ranks as Offset).ranks && a.files == (ranks as Offset).files;
    return a.ranks == ranks && a.files == files;
  }
}

export interface Board {
  white_kingside_castle: boolean;
  white_queenside_castle: boolean;

  black_kingside_castle: boolean;
  black_queenside_castle: boolean;

  white_passant: boolean[];
  black_passant: boolean[];

  pieces: Map<Position, Piece>;
  next: Color;
}

export namespace Board {
  export type Saved = Omit<Board, 'pieces'> & {
    pieces: [number, Piece][];
  };

  export function copy(board: Board): Board {
    return {
      ...board,
      pieces: new Map([...board.pieces]),
    };
  }

  export function save(board: Board): Saved {
    return {
      ...board,
      pieces: [...board.pieces].map(([position, piece]) => [
        Position.all.indexOf(position),
        piece,
      ]),
    };
  }

  export function load(raw: Board.Saved): Board {
    return {
      ...raw,
      pieces: new Map(raw.pieces.map(([i, piece]) => [
        Position.all[i],
        piece,
      ])),
    };
  }

  export function empty(): Board {
    return {
      white_kingside_castle: true,
      white_queenside_castle: true,

      black_kingside_castle: true,
      black_queenside_castle: true,

      white_passant: Position.files.map(() => false),
      black_passant: Position.files.map(() => false),

      pieces: new Map(),
      next: Color.white,
    };
  }

  export function starting(): Board {
    const board = Board.empty();

    const back: PieceKind[] = [
      Piece.rook, Piece.knight, Piece.bishop, Piece.queen,
      Piece.king, Piece.bishop, Piece.knight, Piece.rook,
    ];

    for (const pos of Position.by_rank[1])
      board.pieces.set(pos, Piece(Color.white, Piece.pawn));

    for (const [pos, kind] of zip(Position.by_rank[0], back))
      board.pieces.set(pos, Piece(Color.white, kind));

    for (const pos of Position.by_rank[6])
      board.pieces.set(pos, Piece(Color.black, Piece.pawn));

    for (const [pos, kind] of zip(Position.by_rank[7], back))
      board.pieces.set(pos, Piece(Color.black, kind));

    return board;
  }
}

export interface Move {
  from: Position;
  to: Position;
  promote?: PieceKind;
}

export namespace Move {
  export type Saved = {
    from: number;
    to: number;
    promote: PieceKind | null;
  };

  type BasicResult = { board: Board; captured?: Piece; promoted?: Piece };
  type CastleResult = { board: Board; castle: true };
  type EnPassantResult = { board: Board; en_passant: true; captured: Piece };

  export type Result =
    | BasicResult
    | CastleResult
    | EnPassantResult;

  export function validate(board: Board, move: Move): Result | null {
    function normal(): BasicResult {
      assert(piece != null, 'x');

      board = Board.copy(board);

      if (piece.kind == Piece.king) {
        if (piece.color == Color.white) {
          board.white_kingside_castle = false;
          board.white_queenside_castle = false;
        } else {
          board.black_kingside_castle = false;
          board.black_queenside_castle = false;
        }
      }

      if (piece.kind == Piece.rook) {
        if (move.from == Position.a1) board.white_queenside_castle = false;
        if (move.from == Position.h1) board.white_kingside_castle = false;
        if (move.from == Position.a8) board.black_queenside_castle = false;
        if (move.from == Position.h8) board.black_kingside_castle = false;
      }

      board.white_passant = Position.files.map(() => false);
      if (piece.kind == Piece.pawn && move.from.rank == 2 && move.to.rank == 4)
        board.white_passant[Position.files.indexOf(move.from.file)] = true;

      board.black_passant = Position.files.map(() => false);
      if (piece.kind == Piece.pawn && move.from.rank == 7 && move.to.rank == 5)
        board.black_passant[Position.files.indexOf(move.from.file)] = true;

      board.pieces.delete(move.from);
      board.pieces.set(move.to, piece);

      board.next = piece.color == Color.white ? Color.black : Color.white;

      const result: Result = { board };
      if (captured) result.captured = captured;

      return result;
    }

    function castle(expected_from: Position, rook_from: Position, rook_to: Position): CastleResult | null {
      assert(piece != null, 'x');

      if (move.from != expected_from
        || Position.slide(move.from, move.to, true).some(p => Rules.is_threatened(board, p, piece.color))
        || Position.slide(move.from, rook_from, false).some(p => board.pieces.has(p)))
        return null;

      const result = normal();

      const rook = result.board.pieces.get(rook_from);
      assert(rook != null, 'invalid castle state');
      result.board.pieces.delete(rook_from);
      result.board.pieces.set(rook_to, rook);

      return { board: result.board, castle: true };
    }

    function en_passant(capture: Piece): EnPassantResult {
      const { board } = normal();

      const pair = [...board.pieces].find(pair => pair[1] == capture);
      assert(pair != null, 'invalid move');
      board.pieces.delete(pair[0]);

      return { board, captured: capture, en_passant: true };
    }

    function promotion(): BasicResult | null {
      assert(piece != null, 'x');

      const result = normal();

      if (move.to.rank == 1 || move.to.rank == 8) {
        if (!move.promote)
          return null;

        result.promoted = piece;
        board.pieces.set(move.to, {
          color: piece.color,
          kind: move.promote,
        });
      }

      return result;
    }

    const piece = board.pieces.get(move.from);
    if (piece == null)
      return null;

    const captured = board.pieces.get(move.to);
    if (captured && captured.color == piece.color)
      return null;

    const offset = Position.offset(move.from, move.to);

    switch (piece.kind) {
      case Piece.pawn:
        const dir = piece.color == Color.white ? 1 : -1;
        const origin = piece.color == Color.white ? 2 : 7;

        if (Offset.eq(offset, dir * 1, 0) && !captured)
          return promotion();

        if (Offset.eq(offset, dir * 2, 0) && !captured
          && move.from.rank == origin && !board.pieces.has(Position.add(move.from, dir * 1, 0)))
          return promotion();

        if (Offset.eq(offset, dir * 1, 1) || Offset.eq(offset, dir * 1, -1)) {
          if (captured)
            return promotion();

          const passe = board.pieces.get(Position.add(move.to, dir * -1, 0));
          if (passe && ((piece.color == Color.white && move.from.rank == 5
            && board.black_passant[Position.files.indexOf(move.to.file)])
            || (piece.color == Color.black && move.from.rank == 4
              && board.white_passant[Position.files.indexOf(move.to.file)])))
            return en_passant(passe);
        }

        return null;

      case Piece.rook:
        if ((offset.files == 0 || offset.ranks == 0)
          && Position.slide(move.from, move.to).every(p => !board.pieces.has(p)))
          return normal();

        return null;

      case Piece.bishop:
        if (Math.abs(offset.files) == Math.abs(offset.ranks)
          && Position.slide(move.from, move.to).every(p => !board.pieces.has(p)))
          return normal();

        return null;

      case Piece.knight:
        if (Math.abs(offset.ranks) + Math.abs(offset.files) == 3
          && Math.abs(offset.ranks) != 3 && Math.abs(offset.files) != 3)
          return normal();

        return null;

      case Piece.queen:
        if ((Math.abs(offset.files) == Math.abs(offset.ranks) || offset.files == 0 || offset.ranks == 0)
          && Position.slide(move.from, move.to).every(p => !board.pieces.has(p)))
          return normal();

        return null;

      case Piece.king:
        if (Math.abs(offset.ranks) <= 1 && Math.abs(offset.files) <= 1)
          return normal();

        if (offset.ranks == 0) {
          if (offset.files == 2) {
            if (piece.color == Color.white && board.white_kingside_castle)
              return castle(Position.e1, Position.h1, Position.f1);

            if (piece.color == Color.black && board.black_kingside_castle)
              return castle(Position.e8, Position.h8, Position.f8);
          } else if (offset.files == -2) {
            if (piece.color == Color.white && board.white_queenside_castle)
              return castle(Position.e1, Position.a1, Position.d1);

            if (piece.color == Color.black && board.black_queenside_castle)
              return castle(Position.e8, Position.a8, Position.d8);
          }
        }

        return null;

      default: throw new Error(`invalid piece kind: ${piece.kind}`);
    }
  }

  export function resolve(board: Board, move: Move): Result | null {
    const piece = board.pieces.get(move.from);
    if (piece == null || piece.color != board.next)
      return null;

    const result = validate(board, move);
    if (result == null)
      return null;

    if (Rules.check(result.board, piece.color))
      return null;

    return result;
  }

  export function save(move: Move): Saved {
    return {
      from: Position.all.indexOf(move.from),
      to: Position.all.indexOf(move.to),
      promote: move.promote ?? null,
    };
  }

  export function load(raw: Move.Saved): Move {
    return {
      from: Position.all[raw.from],
      to: Position.all[raw.to],
      promote: raw.promote ?? undefined,
    };
  }
}

export namespace Rules {
  export function check(board: Board, color?: Color): Color | null {
    const list: Color[] = color ? [color] : [Color.white, Color.black];

    for (const color of list) {
      const king = [...board.pieces].find(p => p[1].kind == Piece.king && p[1].color == color);
      if (king && is_threatened(board, king[0], color)) return color;
    }

    return null;
  }

  export function all_legal_moves(board: Board): Map<Position, Map<Position, Move.Result>> {
    const all = new Map<Position, Map<Position, Move.Result>>();

    for (const from of board.pieces.keys()) {
      const map = new Map<Position, Move.Result>();

      for (const to of Position.all) {
        const result = Move.resolve(board, { from, to, promote: Piece.queen });
        if (result != null) {
          map.set(to, result);
        }
      }

      if (map.size > 0) {
        all.set(from, map);
      }
    }

    return all;
  }

  export function is_threatened(board: Board, pos: Position, victim: Color) {
    for (const [from, piece] of board.pieces) {
      if (piece.color != victim && Move.validate(board, { from, to: pos })) {
        return true;
      }
    }

    return false;
  }
}

Object.assign(window, {
  devtoolsFormatters: [
    {
      header(o: any) {
        if (Position.all.includes(o))
          return ['span', {}, `${(o as Position).file}${(o as Position).rank}`];

        if ('color' in o && 'kind' in o)
          return ['span', {}, `${(o as Piece).color}${(o as Piece).kind}`];

        return undefined;
      },

      hasBody(o: any) {
        if (Position.all.includes(o))
          return false;

        if ('color' in o && 'kind' in o)
          return false;

        return undefined;
      },
    },
  ],
});

function zip<T1, T2>(a: T1[], b: T2[]): [T1, T2][] {
  if (a.length != b.length)
    throw new Error('invalid zip');

  return a.map((v, i) => [v, b[i]]);
}
