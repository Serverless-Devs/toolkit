import { keys, replace, split } from 'lodash';
import { RANDOM_PATTERN, REGISTRY, GITHUB_REGISTRY } from '../constant';
import Credential from '@serverless-devs/credential';
import SecretManager from '@serverless-devs/secret';

export { default as getInputs } from './get-inputs';

export const tryfun = async (fn: Function, ...args: any[]) => {
  try {
    return await fn(...args);
  } catch (ex) {}
};

export const getUrlWithLatest = (name: string) => {
  if (REGISTRY.CUSTOM_URL === GITHUB_REGISTRY) {
    if (split(name, '/').length === 1) {
      return `${REGISTRY.CUSTOM_URL}/devsapp/${name}`;
    }
    return `${REGISTRY.CUSTOM_URL}/${name}`;
  }
  return `${REGISTRY.V3}/packages/${name}/release/latest`
};
export const getUrlWithVersion = (name: string, versionId: string) => `${REGISTRY.V3}/packages/${name}/release/tags/${versionId}`;

export const randomId = () => Math.random().toString(36).substring(2, 6);

export const getAllCredential = async ({ logger }: any) => {
  const c = new Credential({ logger });
  return keys(c.getAll());
};

export const getDefaultValue = (value: any) => {
  if (typeof value !== 'string') return;
  return replace(value, RANDOM_PATTERN, randomId());
};

export const getSecretManager = () => {
  const secretManager = SecretManager.getInstance();
  return secretManager;
};
