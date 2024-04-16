export type Command<T extends Record<string, any>> =
  | HandlerCommand<T>
  | SubscribeCommand<T>;
interface logTypes {
  [key: string]: {
    removeFirst: boolean;
    ending?: boolean;
    types: {
      [key: string]: (str: string) => any;
    };
  };
}

function processObjectString(
  types: Record<string, (str: string) => any>,
  str: string,
): Record<string, string> {
  let pattern = `(?=${Object.keys(types).join("|")})`;
  let parts = str
    .split(new RegExp(pattern))
    .map((x) => x.split(/(?<=^[a-z]+ )/).map((x) => x?.trim()));
  return Object.fromEntries(parts);
  /*
  let pattern = new RegExp(
    Object.keys(types).reduce(
      (result, item) =>
        (result += `(?:${result == "" ? "" : " "}(${item})(?: (.+))?)?`),
      "",
    ),
  );
  let obj: Record<string, string> = {};
  let matches = str.match(pattern);
  console.log(str, pattern, matches);
  matches?.shift();
  matches?.reduce(
    (acc, item, index) =>
      index % 2 == 1 || !item ? acc : ((acc[item] = matches[index + 1]), acc),
    obj,
  );
  return obj;
  //*/
  /*
  let key = "";
  let obj: Record<string, string[]> = {};
  if (str != "") {
    str.split(" ").forEach((part) => {
      if (types[part]) {
        key = part;
        obj[key] = [];
      } else {
        obj[key].push(part);
      }
    });
  }
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]): string[] => [k, v.join(" ")]),
  );
  //*/
}

class _Command<T extends Record<string, any>> {
  protected logTypes: logTypes = {};
  getCommandString(): string {
    return "";
  }
  _process(str: string): { data: T; done: boolean } {
    let logType = str.split(" ")[0];
    let options = this.logTypes[logType];
    let done = !!options.ending;
    if (options.removeFirst) {
      str = str.slice(logType.length + 1);
    }
    let data = processObjectString(options.types, str);
    //console.log(data);
    let output: T = data as T;
    Object.keys(data).forEach((key) => {
      if (options.types[key]) {
        output[key as T[string]] = options.types[key](data[key]);
      }
    });
    return { data: output, done: done };
  }
}
export class SubscribeCommand<
  T extends Record<string, string | any>,
> extends _Command<T> {
  subscriber: (data: { data: T; done: boolean }) => any = () => {};
  constructor(subscriber: SubscribeCommand<T>["subscriber"]) {
    super();
    this.subscriber = subscriber;
  }
  async process(
    ...args: Parameters<_Command<T>["_process"]>
  ): Promise<boolean> {
    let { data, done } = await super._process(...args);
    this.subscriber({ data, done });
    return done;
  }
}
export class HandlerCommand<
  T extends Record<string, string | any>,
> extends _Command<T> {
  protected clumpedData: T[] = [];
  handler: (data: T[]) => any = () => {};
  constructor(handler: HandlerCommand<T>["handler"]) {
    super();
    this.handler = handler;
  }
  async process(
    ...args: Parameters<_Command<T>["_process"]>
  ): Promise<boolean> {
    let { data, done } = await super._process(...args);
    if (done) {
      this.handler(this.clumpedData);
    } else {
      this.clumpedData.push(data);
    }
    return done;
  }
}
