import { DecompressOptions } from 'decompress';

export interface IOptions extends DecompressOptions {
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
  /**
   * HTTP headers
   */
  headers?: Record<string, string>;
}
