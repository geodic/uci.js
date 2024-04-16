import { SubscribeCommand } from "./common";

type GoCommandSubscriber = (data: GoResult) => any;
enum GoStopMode {
  depth = 0,
  time = 1,
  infinite = 2,
}
type Info = {
  depth: number;
  seldepth?: number;
  cpuload?: number;
  multipv?: number;
  score: {
    stage: "cp" | "mate";
    value: number;
    type: "regular" | "lowerbound" | "upperbound";
  };
  time: number;
  nodes: number;
  nps: number;
  tbhits: number;
  hashfull: number;
  pv: string[];
  refutation?: string; // TODO
};
interface InfoStatus {
  depth: number;
  currmove: string;
  currmovenumber: string;
  currline?: string; // NOTE: This is probably not the right way to do this
}
interface BestMove {
  bestmove: string;
  ponder: string;
}
interface GoResult {
  type: GoResultType;
  info: Info;
  infoStatus: InfoStatus;
  bestMove: BestMove;
}
export enum GoResultType {
  info = 0,
  infoStatus = 1,
  bestmove = 2,
}
export enum GoScoreStage {
  cp = 0,
  mate = 1,
}
export enum GoScoreType {
  regular = 0,
  lowerbound = 1,
  upperbound = 2,
}

export class GoCommand extends SubscribeCommand<GoResult> {
  protected logTypes = {
    info: {
      removeFirst: true,
      types: {
        depth: parseInt,
        seldepth: parseInt,
        cpuload: parseInt,
        multipv: parseInt,
        score: (str: string) => {
          let parts = str.split(" ");
          return {
            stage: parts[0],
            value: parseInt(parts[1]),
            type: parts[2] || "regular",
          };
        },
        time: parseInt,
        nodes: parseInt,
        nps: parseInt,
        tbhits: parseInt,
        hashfull: parseInt,
        pv: (str: string) => str.split(" "),
        currmove: String,
        currmovenumber: parseInt,
        refutation: String, // TODO
        currline: String, // NOTE: This is probably not the right way to do this
      },
    },
    bestmove: {
      removeFirst: true,
      ending: true,
      types: {
        bestmove: String,
        ponder: String,
      },
    },
  };
  private stopMode: GoStopMode;
  private stopValue?: number;
  private whiteTime?: number;
  private blackTime?: number;
  constructor(
    subscriber: GoCommand["subscriber"],
    stopMode: GoStopMode.depth | GoStopMode.time,
    stopValue: number,
    whiteTime?: number,
    blackTime?: number,
  );
  constructor(
    subscriber: GoCommand["subscriber"],
    stopMode: GoStopMode.infinite,
    whiteTime?: number,
    blackTime?: number,
  );
  constructor(
    subscriber: GoCommand["subscriber"],
    stopMode: GoStopMode,
    stopValue?: number,
    whiteTime?: number,
    blackTime?: number,
  ) {
    super(subscriber);
    this.stopMode = stopMode;
    this.stopValue = stopValue;
    this.whiteTime = whiteTime;
    this.blackTime = blackTime;
  }
  getCommandString(): string {
    return `go ${this.stopMode} \
    ${this.stopMode === GoStopMode.infinite ? "" : this.stopValue} \
    ${this.whiteTime ? `wtime  ${this.whiteTime}` : ""} \
    ${this.blackTime ? `btime  ${this.blackTime}` : ""}`;
  }
}
