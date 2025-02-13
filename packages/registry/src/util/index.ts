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
  // 直接存在则直接返回
  if (fs.existsSync(fileUri)) {
    return fs.readFileSync(fileUri, 'utf-8');
  }

  // 解析路径组成部分
  const parsed = path.parse(fileUri);
  const targetDir = parsed.dir || '.';  // 处理根目录情况
  const targetBaseLower = `${parsed.name}${parsed.ext}`.toLowerCase();

  try {
    // 读取目录下的所有文件
    const files = fs.readdirSync(targetDir);
    
    // 遍历寻找匹配项（忽略大小写）
    for (const file of files) {
      const filePath = path.join(targetDir, file);
      const fileInfo = path.parse(filePath);
      
      // 组合文件名和后缀并转为小写比较
      const fileBaseLower = `${fileInfo.name}${fileInfo.ext}`.toLowerCase();
      
      if (fileBaseLower === targetBaseLower) {
        return fs.readFileSync(filePath, 'utf-8');
      }
    }
  } catch (err) {
    // 目录不存在等异常情况
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
