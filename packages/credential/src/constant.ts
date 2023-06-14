// 支持厂商密钥
export enum PROVIDER {
  alibaba = 'Alibaba Cloud',
  baidu = 'Baidu Cloud',
  huawei = 'Huawei Cloud',
  aws = 'AWS',
  azure = 'Azure',
  google = 'Google Cloud',
  tencent = 'tencent',
  custom = 'Custom',
}

// 选择厂商
export const PROVIDER_LIST = [
  { name: 'Alibaba Cloud (alibaba)', value: PROVIDER.alibaba },
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
  [PROVIDER.alibaba]: 'http://config.devsapp.net/account/alibaba',
  [PROVIDER.aws]: 'http://config.devsapp.net/account/aws',
  [PROVIDER.huawei]: 'http://config.devsapp.net/account/huawei',
  [PROVIDER.azure]: 'http://config.devsapp.net/account/azure',
  [PROVIDER.baidu]: 'http://config.devsapp.net/account/baidu',
  [PROVIDER.google]: 'http://config.devsapp.net/account/gcp',
  [PROVIDER.tencent]: 'http://config.devsapp.net/account/tencent',
};

// 厂商密钥Key列表
export const PROVIDER_CREDENTIAL_KEYS = {
  [PROVIDER.alibaba]: ['AccessKeyID', 'AccessKeySecret'], // AccountID
  [PROVIDER.aws]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.huawei]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.azure]: ['KeyVaultName', 'TenantID', 'ClentID', 'ClientSecret'],
  [PROVIDER.baidu]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.google]: ['PrivateKeyData'],
  [PROVIDER.tencent]: ['AccountID', 'SecretID', 'SecretKey'],
}

export const CRYPTO_STRING = 'SecretKey123';

export const ALIBABA_ENDS_WITH_KEY = '_serverless_devs_key';
