export const EXIT_CODE = {
  // CLI 执行错误
  DEVS: 100,
  // 组件 执行错误
  COMPONENT: 101,
  // 插件 执行错误
  PLUGIN: 101,
  // shell 执行错误
  RUN: 101,
};

export const INFO_EXP_PATTERN = /\$\{resources\.([^.{}]+)\.info(\.[^.{}]+)+}/g;
export const COMPONENT_EXP_PATTERN = /\$\{components\.([^.{}]+)\.output(\.[^.{}]+)+}/g;
export const OUTPUT_EXP_PATTERN = /\$\{resources\.([^.{}]+)\.output(\.[^.{}]+)+}/g;
