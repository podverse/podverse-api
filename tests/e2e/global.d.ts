export {};

declare global {
  var __API_SERVER__: any;
  var __APP_DATA_SOURCE__: any;
}

declare namespace NodeJS {
  interface Global {
    __API_SERVER__: any;
    __APP_DATA_SOURCE__: any;
  }
}