import path from 'path';
import os from 'os';

const Crypto = require('crypto-js');

// 支持厂商密钥
export enum PROVIDER {
  alibaba = 'Alibaba Cloud',
  baidu = 'Baidu Cloud',
  huawei = 'Huawei Cloud',
  volcengine = 'Volcengine',
  aws = 'AWS',
  azure = 'Azure',
  google = 'Google Cloud',
  tencent = 'tencent',
  custom = 'Custom',
}

// 选择厂商
export const PROVIDER_LIST = [
  { name: 'Alibaba Cloud (alibaba)', value: PROVIDER.alibaba },
  { name: 'Volcengine (volcengine)', value: PROVIDER.volcengine },
  { name: 'AWS (aws)', value: PROVIDER.aws },
  { name: 'Azure (azure)', value: PROVIDER.azure },
  { name: 'Baidu Cloud (baidu)', value: PROVIDER.baidu },
  { name: 'Google Cloud (google)', value: PROVIDER.google },
  { name: 'Huawei Cloud (huawei)', value: PROVIDER.huawei },
  { name: 'Tencent Cloud (tencent)', value: PROVIDER.tencent },
  { name: 'Custom (others)', value: PROVIDER.custom },
];

// 厂商密钥获取文档
export const PROVIDER_DOCS = {
  [PROVIDER.alibaba]: 'https://docs.serverless-devs.com/user-guide/config/',
  [PROVIDER.aws]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#aws',
  [PROVIDER.huawei]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#_16',
  [PROVIDER.azure]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#azure',
  [PROVIDER.baidu]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#_15',
  [PROVIDER.google]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#google-cloud',
  [PROVIDER.tencent]: 'https://docs.serverless-devs.com/user-guide/builtin/config/#_17',
  [PROVIDER.volcengine]: 'https://www.volcengine.com/docs/6291/65568',
};

// 厂商密钥Key列表
export const PROVIDER_CREDENTIAL_KEYS = {
  [PROVIDER.alibaba]: ['AccessKeyID', 'AccessKeySecret'], // AccountID
  [PROVIDER.aws]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.huawei]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.azure]: ['KeyVaultName', 'TenantID', 'ClientID', 'ClientSecret'],
  [PROVIDER.baidu]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.google]: ['PrivateKeyData'],
  [PROVIDER.tencent]: ['AccountID', 'SecretID', 'SecretKey'],
  [PROVIDER.volcengine]: ['AccessKey', 'SecretKey'],
};

export const CRYPTO_STRING = 'SecretKey123';
export const CRYPTO_TRUE = Crypto.AES.encrypt('true', CRYPTO_STRING).toString();
export const CRYPTO_FALSE = Crypto.AES.encrypt('false', CRYPTO_STRING).toString();
// 兜底的默认别名
export const DEFAULT_NAME = 'default';
// 兼容 aliyun-cli 获取密钥方式
export const ALIYUN_CLI = '${aliyun-cli}';
export const ALIYUN_CONFIG_FILE = path.join(os.homedir(), '.aliyun', 'config.json');
// 通过环境变量配置特殊获取 KEY
export const ENDS_WITH_KEY_DEVS_KEY = '_serverless_devs_key';
// 环境变量特殊key
export const SYSTEM_ENVIRONMENT_ACCESS = '$system_environment_access';
// 密钥对获取最高优先级
export const KEY_PAIR_IMPORTANT = ['AccountID', 'AccessKeyID', 'AccessKeySecret'];
// 平台环境下设置密钥别名 key
export const CICD_ACCESS_ALIAS_KEY = 'serverless_devs_access_cicd_alias_name';

// cicd 不能出现交互的报错信息
export const DEFAULT_PROMPT_MESSAGE = 'Interaction in cicd environment, throwing exception';
