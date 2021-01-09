import { Board, Move, Piece, Rules } from './chess';
import { assert } from './util';

const letters = new Map([
  [Piece.pawn, ''],
  [Piece.rook, 'R'],
  [Piece.knight, 'N'],
  [Piece.bishop, 'B'],
  [Piece.queen, 'Q'],
  [Piece.king, 'K'],
]);

export interface HistoryEntry {
  move: Move;
  result: Move.Result;
  notation: string;
}

export function notate(board: Board, move: Move, result: Move.Result) {
  let text = '';
  const piece = board.pieces.get(move.from);
  assert(piece != null, 'invalid move');

  if ('castle' in result) {
    if (result.castle == Piece.king)
      text = '0-0';
    else
      text = '0-0-0';
  } else {
    text += letters.get(piece.kind);

    const ambiguous = [...board.pieces].filter(([pos, p]) => pos != move.from
      && p.color == piece.color && p.kind == piece.kind
      && Move.resolve(board, { from: pos, to: move.to }));

    if (ambiguous.length > 0) {
      if (!ambiguous.find(pair => pair[0].file == move.from.file))
        text += move.from.file;
      else if (!ambiguous.find(pair => pair[0].rank == move.from.rank))
        text += move.from.rank;
      else
        text += move.from.file + move.from.rank;
    }

    if (result.capture) {
      text += 'x';
    }

    text += move.to.file + move.to.rank;

    if (move.promotion) {
      text += letters.get(move.promotion);
    }
  }

  if (Rules.check(result.board)) {
    if (Rules.all_legal_moves(result.board).size == 0)
      text += '#';
    else
      text += '+';
  }

  return text;
}
