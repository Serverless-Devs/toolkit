import { IStep } from '@serverless-devs/parse-spec';
import { IOptions as ILogConfig } from '@serverless-devs/logger/lib/type';
import Logger, { ILoggerInstance } from '@serverless-devs/logger';
import { AssertionError } from 'assert';
import { DevsError } from '@serverless-devs/utils';
import { Diff } from 'deep-diff';
export interface IEngineOptions {
  args?: string[]; //默认 process.argv.slice(2)
  template?: string;
  env?: Record<string, string>;
  cwd?: string; //当前工作目录
  logConfig?: Partial<ILogConfig> & {
    customLogger?: Logger;
  };
  verify?: boolean;
  serverlessDevsVersion?: string;
}

export type IDiff = Omit<Diff<Object, Object>, "path"> & {
  path?: string | undefined;
}

export type IStepOptions = IStep & {
  logger: ILoggerInstance; // logger实例
  instance?: any; //组件实例
  id?: string;
  if?: string;
  'continue-on-error'?: boolean;
  'working-directory'?: string;
  // 内部字段
  stepCount?: string;
  status?: string;
  error?: Error;
  output?: Record<string, any>;
  process_time?: number;
  credential?: Record<string, any>;
  done?: boolean; //当前步骤是否执行完成
};

export enum STEP_IF {
  SUCCESS = 'success()',
  FAILURE = 'failure()',
  ALWAYS = 'always()',
}

export enum STEP_STATUS_BASE {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RUNNING = 'running',
  PENDING = 'pending',
  ERROR_WITH_CONTINUE = 'error-with-continue',
}

export type IStatus = `${STEP_STATUS_BASE}`;

enum STEP_STATUS_SKIP {
  SKIP = 'skipped',
}

export const STEP_STATUS = { ...STEP_STATUS_BASE, ...STEP_STATUS_SKIP };

export interface IRecord {
  editStatusAble: boolean; // 记录全局的执行状态是否可修改（一旦失败，便不可修改）
  steps: Record<string, any>; // 记录每个 step 的执行状态以及输出，后续step可以通过steps[$step_id].output使用该数据
  status: IStatus; // 记录step的状态
  startTime: number; // 记录step的开始时间
  componentProps: Record<string, any>; // 记录组件的inputs
}

export interface IContext {
  cwd: string; // 当前工作目录
  stepCount: string; // 记录当前执行的step
  steps: IStepOptions[];
  env: Record<string, any>; // 记录合并后的环境变量
  status: IStatus; // 记录task的状态
  completed: boolean; // 记录task是否执行完成
  inputs: Record<string, any>; // 记录inputs的输入(魔法变量)
  error: IEngineError[]; // 记录step的错误信息
  output: Record<string, any>; // 记录step的输出
  credential: Record<string, any>; // 尝试获取到的密钥信息
  allSteps: IStepOptions[]; // 记录所有step
}

export type IEngineError = Error | AssertionError | DevsError;
