export interface ICredentials {
  AccountID: string;
  AccessKeyID: string;
  AccessKeySecret: string;
  SecurityToken?: string;
}

export interface IInputs {
  props: Record<string, any>; // 用户自定义输入
  name: string;
  command: string; // 执行指令
  yaml: {
    path: string; // 配置路径
  };
  resource: {
    name: string; // yaml 声明 resource 的 name
    component: string; // 组件名（支持本地绝对路径）
    access: string; // 访问秘钥名
  };
  getCredential: () => Promise<ICredentials | any>; // 获取用户秘钥
  args: string[];
  cwd: string;
  outputs?: Record<string, any>;
  output?: Record<string, any>; // 当前步骤输出
  diffs?: Record<string, any>[]; // 当 --baseline-template 参数存在时，和基线yaml做diff
}
