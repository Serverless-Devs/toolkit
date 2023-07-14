import Credential from '@serverless-devs/credential';
import { ILoggerInstance } from '@serverless-devs/logger';
import { IAllowFailure } from '@serverless-devs/parse-spec';
import flatted from 'flatted';
import { get, omit, set, map, includes } from 'lodash';

export function getLogPath(filePath: string) {
  return `step_${filePath}.log`;
}

export const randomId = () => Math.random().toString(16).slice(2);

export function getProcessTime(time: number) {
  return (Math.round((Date.now() - time) / 10) * 10) / 1000;
}

export async function getCredential(access: string | undefined, logger: ILoggerInstance) {
  try {
    const instance = new Credential({ logger });
    const res = await instance.get(access);
    return get(res, 'credential', {});
  } catch (error) {
    return {};
  }
}

export const stringify = (value: any) => {
  try {
    const data = { ...value };
    const steps = get(value, 'steps');
    if (steps) {
      set(
        data,
        'steps',
        map(steps, (step: any) => omit(step, 'instance')),
      );
    }
    const instance = get(data, 'instance');
    if (instance) {
      delete data.instance;
    }
    return JSON.stringify(data);
  } catch (error) {
    return flatted.stringify(value);
  }
};

export const getAllowFailure = (
  allowFailure: boolean | IAllowFailure | undefined,
  data: { exitCode?: number; command?: string },
): boolean => {
  if (!allowFailure) return false;
  if (typeof allowFailure === 'boolean') {
    return allowFailure;
  }
  if ('exitCode' in data && 'command' in data) {
    return (
      includes(get(allowFailure, 'exit_code'), get(data, 'exitCode')) &&
      includes(get(allowFailure, 'command'), get(data, 'command'))
    );
  }
  if ('exitCode' in data) {
    return includes(get(allowFailure, 'exit_code'), get(data, 'exitCode'));
  }
  if ('command' in data) {
    return includes(get(allowFailure, 'command'), get(data, 'command'));
  }
  return false;
};
