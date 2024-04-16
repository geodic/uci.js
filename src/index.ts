import { UciCommand } from "./uci";
import { GoCommand, GoResultType, GoScoreStage, GoScoreType } from "./go";
import { IsReadyCommand } from "./isready";
import { Command } from "./common";

export enum PositionType {
  fen = 0,
  startpos = 1,
}
export class Engine {
  sendCommand: (cmd: string) => any;
  command?: Command<any>;
  protected position: {
    type: PositionType;
    moves: string[];
  } = { type: PositionType.startpos, moves: [] };
  constructor(sendCommand: (cmd: string) => any) {
    this.sendCommand = sendCommand;
  }
  async information(msg: string) {
    if (this.command === undefined) throw new Error();
    let completed = await this.command.process(msg);
    if (completed) {
      this.command = undefined;
    }
  }
  protected runRawCommand(cmd: string, check = true): void {
    if (check && this.command) throw new Error();
    this.sendCommand(cmd);
  }
  protected updatePosition(): void {
    this.runRawCommand(
      `position ${this.position.type == PositionType.fen ? "fen" : "startpos"} ${this.position.moves.join(" ")}`,
    );
  }
  setPosition(type?: PositionType, moves?: string[]): void {
    this.position.type = type || this.position.type;
    this.position.moves = moves || this.position.moves;
    this.updatePosition();
  }
  makeMove(moves: string | string[]): void {
    if (Array.isArray(moves)) {
      this.position.moves.concat(moves);
    } else {
      this.position.moves.push(moves);
    }
    this.updatePosition();
  }
  newGame(): void {
    this.runRawCommand("ucinewgame");
    this.setPosition(PositionType.startpos, []);
  }
  execute(command: Command<any>): void {
    if (this.command) throw new Error();
    this.command = command;
    let commandString = command.getCommandString();
    this.sendCommand(commandString);
  }
  stop() {
    this.sendCommand("stop");
  }
}
