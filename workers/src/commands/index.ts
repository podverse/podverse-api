import { queueParserRSSAddAll } from "@workers/commands/queue/rss/addAll";

export type CommandLineArgs = { [key: string]: string | string[] };

export default {
  queueParserRSSAddAll
} as { [key: string]: (args: CommandLineArgs) => void };
