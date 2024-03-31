import chalk from 'chalk';
import { getGlobalConfig } from '@serverless-devs/utils';

export const gray = chalk.hex('#8c8d91');
export const RANDOM_PATTERN = '${default-suffix}';
export const DEVSAPP = 'devsapp';
export const GITHUB_REGISTRY = 'https://api.github.com/repos';

export const REGISTRY = {
  V2: 'https://registry.devsapp.cn/simple',
  V3: 'https://api.devsapp.cn/v3',
  CUSTOM_URL: getGlobalConfig('registry'),
};

export const CONFIGURE_LATER = 'configure_later';
export const DEFAULT_MAGIC_ACCESS = '{{ access }}';
export const REGX = /\${([\w\W]*?)}/;


