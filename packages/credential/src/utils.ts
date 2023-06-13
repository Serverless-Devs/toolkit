import minimist from 'minimist';
import path from 'path';
import fs from 'fs-extra';
import { defaultsDeep, isEmpty } from 'lodash';
import yaml from 'js-yaml';
// @ts-ignore
import { getRootHome } from '@serverless-devs/utils';
import { ALIAS_DEFAULT_NAME } from './constant';
import { ICredentials } from './actions/set/type';

const DEFAULT_OPTS = {
  alias: {
    access: 'a',
    help: 'h',
    force: 'f',
  },
  boolean: ['help', 'force'],
  string: ['access'],
}

/**
 * 解析参数
 * @param opts 
 * @returns 
 */
export function parseArgv(opts?: minimist.Opts): Record<string, any> {
  // 需要考虑两个 case
  //   1. 包含空格: -e '{ "setCredential": "value" }'
  //   2. -la => l + a
  //   2. --la => la
  const argv = process.argv.splice(2);

  if (isEmpty(argv)) {
    return { _: [] };
  }

  return minimist(argv, defaultsDeep(opts, DEFAULT_OPTS));
}

/**
 * 获取 yaml 文件路径
 */
export function getYamlPath(): string {
  const fileYamlPath = path.join(getRootHome(), 'access.yaml');
  if (fs.existsSync(fileYamlPath)) {
    return fileYamlPath;
  }

  const fileYmlPath = path.join(getRootHome(), 'access.yml');
  if (fs.existsSync(fileYmlPath)) {
    return fileYmlPath;
  }

  return fileYamlPath;
}

/**
 * 获取密钥文件的内容
 * @returns 
 */
export function getYamlContent(): Record<string, any> {
  const fileYamlPath = getYamlPath();

  if (fs.existsSync(fileYamlPath)) {
    const content = fs.readFileSync(fileYamlPath, 'utf8');
    return yaml.load(content) as any;
  }

  return {};
}

/**
 * 获取设置密钥默认名称
 * @returns 
 */
export async function getAliasDefault(content?: Record<string, any>) {
  if (isEmpty(content)) {
    return ALIAS_DEFAULT_NAME;
  }

  const keys = Object.keys(content).filter((item) => item.startsWith(ALIAS_DEFAULT_NAME))
  if (keys.length === 0) {
    return ALIAS_DEFAULT_NAME;
  }

  let max = 0;

  keys.forEach((item) => {
    const [, end] = item.split('-');
    const e = parseInt(end);
    if (!isNaN(e) && e > max) {
      max = e;
    }
  });

  return `${ALIAS_DEFAULT_NAME}-${max + 1}`;
}

export async function writeData(content: Record<string, ICredentials>) {
  try {
    fs.ensureDirSync(getRootHome());
    fs.writeFileSync(getYamlPath(), yaml.dump(content));
  } catch (ex) {
    throw new Error('Configuration failed');
  }
}
