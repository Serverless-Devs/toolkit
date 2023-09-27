import { URL } from 'url';
import https from 'https';
import http, { IncomingMessage } from 'http';
import fs from 'fs-extra';
import decompress from 'decompress';
import chalk from 'chalk';
import path from 'path';
import { IOptions } from './types';
import { DEFAULT_FILENAME } from './constants';
import assert from 'assert';

class Download {
  constructor(private url: string, private options: IOptions = {}) {
    this.options.dest = this.options.dest || process.cwd();
    this.options.logger = this.options.logger || console;
    this.options.filename = this.options.filename || DEFAULT_FILENAME;
  }
  async run() {
    const { logger } = this.options;
    const uri = new URL(this.url);
    const write = logger.write ? (...args: any) => logger.write.apply(logger, args) : logger.log;
    write(`Downloading[${chalk.green(decodeURIComponent(uri.pathname))}]...`);
    try {
      const filePath = await this.doDownload(this.url);
      await this.doDecompress(filePath);
      write(`Download ${this.options.filename} successfully`);
    } catch (error) {
      write(`Download ${this.options.filename} failed`);
      throw error;
    }
  }
  async uri() {
    // local zip file
    if (this.url.endsWith('.zip')) {
      return await this.doDecompress(this.url);
    }
    // local directory
    if (this.url === this.options.dest) {
      return this.url;
    }
    fs.moveSync(this.url, this.options.dest as string, { overwrite: true });
  }
  private async doDecompress(filePath: string) {
    const { dest } = this.options;
    const { extract, filename, ...restOpts } = this.options;
    if (!extract) return;
    // node-v12.22.1: end of central directory record signature not found
    for (let index = 0; index < 3; index++) {
      try {
        await decompress(filePath, dest, restOpts);
        break;
      } catch (error) {
        if (index === 2) {
          throw error;
        }
      }
    }
    if (fs.existsSync(filePath)) {
      fs.removeSync(filePath);
    }
  }
  private async doDownload(url: string): Promise<string> {
    const { headers } = this.options;
    const dest = this.options.dest as string;
    const filename = this.options.filename as string;
    const uri = new URL(url);
    const pkg = url.toLowerCase().startsWith('https:') ? https : http;
    return new Promise((resolve, reject) => {
      pkg.get(uri.href, { headers }).on('response', (response: IncomingMessage) => {
        fs.ensureDirSync(dest);
        const filePath = path.join(dest, `${filename}.zip`);
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          file.on('open', () => {
            response
              .on('data', chunk => {
                file.write(chunk);
              })
              .on('end', () => {
                file.end();
                resolve(filePath);
              })
              .on('error', err => {
                file.destroy();
                fs.unlink(dest, () => reject(err));
              });
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Recursively follow redirects, only a 200 will resolve.
          this.doDownload(response.headers.location as string).then(val => resolve(val));
        } else {
          reject({
            code: response.statusCode,
            message: response.statusMessage,
          });
        }
      });
    });
  }
}

export default async (url: string, options: IOptions = {}) => {
  assert(url, 'url is required');
  const download = new Download(url, options);
  if (fs.existsSync(url)) {
    return await download.uri();
  }
  assert(url.startsWith('http'), 'url must be http or https');
  return await download.run();
};
