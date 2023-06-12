
# 日志(@serverless-devs/logger)

## 安装

```bash
$ npm install @serverless-devs/logger --save
```

## 使用方式

```ts
import getLogger from '@serverless-devs/logger';


/**
 * const { key1, key2, __clear, __progressFooter } = loggers;
 * 其中 key1 和 key2 是根据入参 keys 返回，使用方式如下。
 * __clear 是清理动态效果的作用，需要在退出程序之前调用
 * __progressFooter 是管理动态效果的，基于 cli-progress-footer 实现
 */
const loggers = await getLogger(['key1', 'key2'], {
  traceId: 'uuid',
  logDir: 'logFilePath',
  secrets: ['需加密字符'],
});

// egg-logger
loggers.key1.info('info');
loggers.key1.warn('warn');
loggers.key1.debug('warn');
loggers.key1.error('error');
// @serverless-devs/logger 自定义的包
loggers.key1.append('append', 'INFO'); // 用于流持续输出，不受 eol 限制输出。例如：mvn命令在linux下通过文件流有换行异常可以使用此方法持续输出内容
loggers.key1.progress('update progress footer bar'); // 修改底部的动态效果文案

loggers.__progressFooter.upsert('runId', '新增一个动态效果,这是文案');
loggers.__progressFooter.removeItem('runId');

loggers.__clear();
```

## 参数解析

```ts
import getLogger from '@serverless-devs/logger';
const loggers = await getLogger(keys, options);
```

| 参数      | 说明         | 类型                          | 必填 | 默认值        |
| --------- | ------------ | ----------------------------- | ---- | ------------- |
| keys | 日志实例的关键字 | string[] | 是 | - |
| options | 方法入参 | [Options](#Options) | 是 | - |


### Options

| 参数      | 说明         | 类型                          | 必填 | 默认值        |
| --------- | ------------ | ----------------------------- | ---- | ------------- |
| traceId    | 程序运行关键字   |  string     | 是   |  - |
| logDir    | 日志输出目录   |  string     | 是   |  - |
| level    | 终端日志输出级别   |  `ALL`、`DEBUG`、`INFO`、`WARN`、`ERROR`、`NONE`  | 否   | 终端输出默认为：`INFO`；输出到文件默认为：`DEBUG` |
| secrets    | 需加密字符   |  string[]     | 否   |  - |
| eol    | 自定义文件结尾   |  string  | 否   |  `os.EOL` |

## 控制输出级别

可以通过环境变量 NODE_CONSOLE_LOGGRE_LEVEL=`ALL`、`DEBUG`、`INFO`、`WARN`、`ERROR`、`NONE` 控制输出级别，权重大于 options.level
