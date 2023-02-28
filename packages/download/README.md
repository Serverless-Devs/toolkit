
# 下载(@serverless-devs/download)

## 安装

```bash
$ npm install @serverless-devs/download --save
```

## 基本使用

```ts
import download from '@serverless-devs/download';

download({ url: 'https://registry.devsapp.cn/simple/devsapp/core/zipball/0.1.54' })
```

## 参数解析

```ts
import download from '@serverless-devs/download';
download({url, dest, logger}, options)
```

| 参数    | 说明            | 类型    | 必填 | 默认值 |
| ------- | --------------- | ------- | ---- | ------ |
| url | 下载地址 | string       | 是   |        |
| dest | 文件保存路径 | string | 是   |        |
| logger | 输出日志 | Function | 否   |   console     |
| options | 方法入参 | Options | 否   |        |

## Options

| 参数      | 说明         | 类型                          | 必填 | 默认值        |
| --------- | ------------ | ----------------------------- | ---- | ------------- |
| ...[DecompressOptions](https://github.com/kevva/decompress#options)       |  |                      |    |   |
| extract       | 文件是否解压 | boolean                     | 否   |  false |
| filename     | 文件保存的名称  | string                       | 否   |         demo.zip      |
| strip        |解压文件时的提取层级    |  number     | 否   |      0         |



