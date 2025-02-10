import fs from 'fs';
import { registry, getYamlPath } from '@serverless-devs/utils';
import path from 'path';

export * as request from './request';

/**
 * 获取 yaml 的内容
 * @param filePath 文件路径（不需要后缀）
 * @returns
 */
export const getYamlContentText = (filePath: string): string | undefined => {
  const fileUri = getYamlPath(filePath);
  if (fileUri) {
    return fs.readFileSync(fileUri, 'utf-8');
  }
  return undefined;
};

/**
 * 获取 md 文件内容
 * @param filePath 文件路径（需要后缀）
 * @returns
 */
export const getContentText = (fileUri: string): string | undefined => {
  if (fs.existsSync(fileUri)) {
    return fs.readFileSync(fileUri, 'utf-8');
  }

  //支持不同后缀
  const parsed = path.parse(fileUri);
  // 生成可能的后缀组合（小写和大写）
  const extensionsToTry = [parsed.ext.toLowerCase(), parsed.ext.toUpperCase()];

  for (const ext of extensionsToTry) {
    const modifiedPath = path.join(parsed.dir, `${parsed.name}${ext}`);
    if (fs.existsSync(modifiedPath)) {
      return fs.readFileSync(modifiedPath, 'utf-8');
    }
  }
  return undefined;
};

export function writeFile(token: string) {
  const platformPath = registry.getPlatformPath();

  const fd = fs.openSync(platformPath, 'w+');
  fs.writeSync(fd, token);
  fs.closeSync(fd);
}

export const sleep = async (timer: number) => await new Promise(resolve => setTimeout(resolve, timer));
