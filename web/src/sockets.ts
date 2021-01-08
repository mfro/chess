import { Board, Color, Move } from './chess';
import { assert } from './util';

export type MessageType<T> = {
  id: number;
  pack: (value: T) => string;
};

const allMessages: number[] = [];
function define_message<T = void>(): MessageType<T> {
  const id = allMessages.length;
  allMessages.push(id);
  return {
    id,
    pack(value) {
      if (value === undefined)
        return id.toString();
      return JSON.stringify([id, value]);
    },
  };
}

export interface Dispatch {
  register(message: MessageType<void>, handler: () => void): void;
  register<T>(message: MessageType<T>, handler: (msg: T) => void): T;

  dispatch(data: string): void;
}

export const GetState = define_message();
export const SetState = define_message<{ board: Board.Saved; color: Color; history: Move.Saved[] }>();

export const AddMove = define_message<Move.Saved>();

export function dispatch(): Dispatch {
  const registered = new Map<number, (a: any) => void>();

  return {
    register<T>(message: MessageType<T>, handler: (arg: T) => void) {
      registered.set(message.id, handler);
    },
    dispatch(data: string) {
      const parsed = JSON.parse(data);

      let id, value;
      if (typeof parsed == 'number') {
        id = parsed;
        value = undefined;
      } else if (Array.isArray(parsed) && parsed.length == 2) {
        [id, value] = parsed;
      } else {
        throw new Error('invalid message');
      }

      const callback = registered.get(id);
      assert(callback != null, `no handler: ${id}`);
      callback(value);
    },
  };
}
