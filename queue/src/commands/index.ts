import { parserRSSAddAll } from "@queue/commands/parser/rss/addAll";

export type CommandLineArgs = { [key: string]: string | string[] };

export default {
  parserRSSAddAll
} as { [key: string]: (args: CommandLineArgs) => void };
