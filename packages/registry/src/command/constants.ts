// *** 登陆 *** //
// github回调
export const GITHUB_LOGIN_URL =
  'https://github.com/login/oauth/authorize?client_id=beae900546180c7bbdd6&redirect_uri=https://registry.devsapp.cn/user/login/github';
// 登陆
export const REGISTRY_INFORMATION_GITHUB = 'https://registry.devsapp.cn/user/information/github';
// 刷新 token
export const RESET_URL = 'https://registry.devsapp.cn/user/update/safetycode';

// *** 发布 *** //
export const PUBLISH_URL = 'https://registry.devsapp.cn/package/publish';

// *** 已发布列表 *** //
export const CENTER_PUBLISH_URL = 'https://registry.devsapp.cn/center/package/publish';

// *** 指定仓库详情 *** //
export const getDetailUrl = (name: string) => `https://registry.devsapp.cn/simple/${name}/releases`;

// *** 删除 url *** //
export const REMOVE_URL = 'https://registry.devsapp.cn/package/delete';