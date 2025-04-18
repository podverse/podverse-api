export {};

declare global {
  var __API_SERVER__: any;
}

declare namespace NodeJS {
  interface Global {
    __API_SERVER__: any;
  }
}