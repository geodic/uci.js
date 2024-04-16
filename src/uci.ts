import { HandlerCommand } from "./common";

type BasicPrimitives = string | number | boolean;
type Primitives =
  | BasicPrimitives
  | BasicPrimitives[]
  | Record<string | number, BasicPrimitives>;
interface UciResult {
  name: string;
  author: string;
  type: string;
  default: Primitives;
  min: number;
  max: number;
}

function parsePrimitive(value: string): Primitives {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export class UciCommand extends HandlerCommand<UciResult> {
  protected logTypes = {
    id: {
      removeFirst: true,
      types: {
        name: String,
        author: String,
      },
    },
    option: {
      removeFirst: true,
      types: {
        name: String,
        type: String,
        default: parsePrimitive,
        min: parseInt,
        max: parseInt,
      },
    },
    uciok: {
      removeFirst: true,
      ending: true,
      types: {},
    },
  };
  constructor(handler: UciCommand["handler"]) {
    super(handler);
  }
  getCommandString(): string {
    return "uci";
  }
}
