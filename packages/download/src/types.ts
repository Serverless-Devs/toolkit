import { DecompressOptions as _DecompressOptions } from 'decompress';

export interface IConfig {
  /**
   * URL to download
   */
  url: string;
  /**
   * Path to where your file will be written.
   *
   * @default process.cwd()
   */
  dest?: string;
  /**
   * The logger
   */
  logger?: any;
}

export interface DecompressOptions extends _DecompressOptions {
  /**
   * If set to `true`, try extracting the file using [`decompress`](https://github.com/kevva/decompress).
   *
   * @default false
   */
  extract?: boolean;
  /**
   * Name of the saved file.
   *
   * @default demo.zip
   */
  filename?: string;
}
