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

export const PROVIDER_DOCS = {
  [PROVIDER.alibaba]: 'http://config.devsapp.net/account/alibaba',
  [PROVIDER.aws]: 'http://config.devsapp.net/account/aws',
  [PROVIDER.huawei]: 'http://config.devsapp.net/account/huawei',
  [PROVIDER.azure]: 'http://config.devsapp.net/account/azure',
  [PROVIDER.baidu]: 'http://config.devsapp.net/account/baidu',
  [PROVIDER.google]: 'http://config.devsapp.net/account/gcp',
  [PROVIDER.tencent]: 'http://config.devsapp.net/account/tencent',
};

export const PROVIDER_CREDENTIAL_KEYS = {
  [PROVIDER.alibaba]: ['AccessKeyID', 'AccessKeySecret'], // AccountID
  [PROVIDER.aws]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.huawei]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.azure]: ['KeyVaultName', 'TenantID', 'ClentID', 'ClientSecret'],
  [PROVIDER.baidu]: ['AccessKeyID', 'SecretAccessKey'],
  [PROVIDER.google]: ['PrivateKeyData'],
  [PROVIDER.tencent]: ['AccountID', 'SecretID', 'SecretKey'],
}

export const PROVIDER_LIST = [
  {
    type: 'list',
    name: 'provider',
    message: 'Please select a provider:',
    choices: [
      { name: 'Alibaba Cloud (alibaba)', value: PROVIDER.alibaba },
      { name: 'AWS (aws)', value: PROVIDER.aws },
      { name: 'Azure (azure)', value: PROVIDER.azure },
      { name: 'Baidu Cloud (baidu)', value: PROVIDER.baidu },
      { name: 'Google Cloud (google)', value: PROVIDER.google },
      { name: 'Huawei Cloud (huawei)', value: PROVIDER.huawei },
      { name: 'Tencent Cloud (tencent)', value: PROVIDER.tencent },
      { name: 'Custom (others)', value: PROVIDER.custom },
    ],
  }
];

export const ALIAS_DEFAULT_NAME = 'default';


export const CRYPTO_STRING = 'SecretKey123';