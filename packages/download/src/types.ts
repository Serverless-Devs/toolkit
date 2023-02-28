import { DecompressOptions as _DecompressOptions } from 'decompress';

export interface IConfig {
  url: string;
  dest: string;
  logger?: any;
}

export interface DecompressOptions extends _DecompressOptions {
  // If set to true, try extracting the file using [`decompress`](https://github.com/kevva/decompress).
  extract?: boolean;
  // Name of the saved file, default value is demo.zip
  filename?: string;
}
