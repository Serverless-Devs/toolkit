import { URL } from 'url';
import https from 'https';
import http, { IncomingMessage } from 'http';
import fs from 'fs-extra';
import decompress from 'decompress';
import path from 'path';
import { IConfig, DecompressOptions } from './types';
import { DEFAULT_FILENAME } from './constants';

class Download {
  constructor(private config: IConfig, private options: DecompressOptions = {}) {
    this.config.dest = this.config.dest || process.cwd();
    this.config.logger = this.config.logger || console;
    this.options.filename = this.options.filename || DEFAULT_FILENAME;
    this.validate();
  }
  private validate() {
    const { url } = this.config;
    if (!url) {
      throw new Error('url is required');
    }
    if (!url.toLowerCase().startsWith('http')) {
      throw new Error('url must be http or https');
    }
  }

  async run() {
    const { logger } = this.config;
    logger.log('下载中...');
    const { url } = this.config;
    try {
      const filePath = await this.doDownload(url);
      this.doDecompress(filePath);
      logger.log('下载完成');
    } catch (error) {
      logger.error('下载失败');
    }
  }
  private async doDecompress(filePath: string) {
    const { dest } = this.config;
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
    await fs.unlink(filePath);
  }
  private async doDownload(url: string): Promise<string> {
    const dest = this.config.dest as string;
    const filename = this.options.filename as string;
    const uri = new URL(url);
    const pkg = url.toLowerCase().startsWith('https:') ? https : http;
    return new Promise((resolve, reject) => {
      pkg.get(uri.href).on('response', (response: IncomingMessage) => {
        fs.ensureDirSync(dest);
        const filePath = path.join(dest, filename);
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          file.on('open', () => {
            response
              .on('data', (chunk) => {
                file.write(chunk);
              })
              .on('end', () => {
                file.end();
                resolve(filePath);
              })
              .on('error', (err) => {
                file.destroy();
                fs.unlink(dest, () => reject(err));
              });
          });
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Recursively follow redirects, only a 200 will resolve.
          this.doDownload(response.headers.location as string).then((val) => resolve(val));
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

export default async (config: IConfig, options?: DecompressOptions) => {
  const download = new Download(config, options);
  return await download.run();
};
