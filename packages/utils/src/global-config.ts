import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import getRootHome from './get-root-home';
import getYamlContent from './get-yaml-content';

// fs.mkdirSync(dirname, { recursive: true });
const rootHome = getRootHome();

// 全局配置文件存放位置
export const GLOBAL_CONFIG_FILE_PATH = path.join(rootHome, 'set-config.yml');

export const getGlobalConfig = (key: string, fallback?: string) => {
  const content = getYamlContent(GLOBAL_CONFIG_FILE_PATH);
  return content?.[key] || fallback;
};

// TODO: 目前只更新了Serverless Devs的utils版本号
export const clearGlobalConfig = (key: string) => {
  fs.writeFileSync(GLOBAL_CONFIG_FILE_PATH, yaml.dump({
    ...getYamlContent(GLOBAL_CONFIG_FILE_PATH),
    [key]: undefined,
  }));
};

export const setGlobalConfig = (key: string, value: unknown) => {
  // 创建 a 目录以及其子目录
  fs.mkdirSync(rootHome, { recursive: true });

  const content = getYamlContent(GLOBAL_CONFIG_FILE_PATH) || {};
  content[key] = value;

  fs.writeFileSync(GLOBAL_CONFIG_FILE_PATH, yaml.dump(content));
};
