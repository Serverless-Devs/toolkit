import { getGlobalConfig } from '@serverless-devs/utils';

const baseUrl =
  getGlobalConfig('registry', 'https://api.devsapp.cn/v3') === 'https://api.devsapp.cn/v3'
    ? 'https://server-serverlgistry-v-awljqvnszb.cn-hangzhou.fcapp.run/v3'
    : getGlobalConfig('registry', 'https://api.devsapp.cn/v3');
// *** 登陆 *** //
// 登陆
export const REGISTRY_INFORMATION_GITHUB = `${baseUrl}/user/check`;

// github回调
export const GITHUB_LOGIN_URL = `https://github.com/login/oauth/authorize?client_id=ef1df7f4f6b9e5a343af&redirect_uri=${baseUrl}/user/login`;
// 刷新 token
export const RESET_URL = `${baseUrl}/user/token`;

// *** 发布 *** //
export const PUBLISH_URL = `${baseUrl}/packages/releases`;

// *** 用户Packages查找 *** //
export const PRIVATE_LIST_URL = `${baseUrl}/package/user`;

// *** 指定仓库详情 *** //
export const getDetailUrl = (name: string) => `${baseUrl}/packages/${name}/release`;

// ** 获取最新版本的 ** //
export const getDetailLatestUrl = (name: string) => `${baseUrl}/packages/${name}/release/latest`;

export const getPackageUrl = (name: string, versionId: string) => `${baseUrl}/packages/${name}/release/tags/${versionId}`;
