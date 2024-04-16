import { HandlerCommand } from "./common";

interface IsReadyResult {
  readyok: boolean;
}

export class IsReadyCommand extends HandlerCommand<IsReadyResult> {
  protected logTypes = {
    readyok: {
      removeFirst: false,
      types: {
        readyok: (str: string) => (str === "readyok" ? true : false),
      },
    },
  };
}
